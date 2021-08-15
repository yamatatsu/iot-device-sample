import events from "events";
import { mqtt, http, io, iot } from "aws-iot-device-sdk-v2";
import { Args } from "./types";

type Props = {
  endpoint: string;
  ca_file: string;
  cert: string;
  key: string;
};

export default function main(props: Props) {
  return async (argv: Args) => {
    // force node to wait 60 seconds before killing itself, promises do not keep node alive
    const timer = setTimeout(() => {}, 60 * 1000);

    const config = createConfig(props, argv);
    const client = createClient(argv);
    const connection = client.new_connection(config);

    await connection.connect();

    const emitter = new events.EventEmitter();

    await connection.subscribe(
      argv.topic,
      mqtt.QoS.AtLeastOnce,
      (topic, payload, dup, qos, retain) => {
        const message = parsePayload(payload);
        console.log(
          `Publish received. topic:"${topic}" dup:${dup} qos:${qos} retain:${retain}`
        );
        console.log(message);

        if (message.sequence == argv.count) {
          emitter.emit("finish");
        }
      }
    );

    const finishPromise = new Promise<void>(async (resolve, reject) => {
      emitter.on("finish", resolve);
    });

    await runMultipleTimes(argv.count, async (count) => {
      await connection.publish(
        argv.topic,
        getPayload(argv.message, count),
        mqtt.QoS.AtLeastOnce
      );
    });

    await finishPromise;

    await connection.disconnect();

    // Allow node to die if the promise above resolved
    clearTimeout(timer);
  };
}

function createConfig(props: Props, argv: Args) {
  const configBuilder =
    iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(
      props.cert,
      props.key
    );

  if (argv.proxy_host) {
    configBuilder.with_http_proxy_options(
      new http.HttpProxyOptions(argv.proxy_host, argv.proxy_port)
    );
  }

  configBuilder.with_certificate_authority_from_path(undefined, props.ca_file);

  configBuilder.with_clean_session(false);
  configBuilder.with_client_id(
    argv.client_id || "test-" + Math.floor(Math.random() * 100000000)
  );
  configBuilder.with_endpoint(props.endpoint);

  const config = configBuilder.build();

  return config;
}

function createClient(argv: Args) {
  const level: io.LogLevel = io.LogLevel[argv.verbosity];
  io.enable_logging(level);

  const clientBootstrap = new io.ClientBootstrap();

  const client = new mqtt.MqttClient(clientBootstrap);
  return client;
}

const decoder = new TextDecoder("utf8");
function parsePayload(payload: ArrayBuffer) {
  const json = decoder.decode(payload);
  console.log(json);
  return JSON.parse(json);
}
function getPayload(message: string, sequence: number) {
  return JSON.stringify({ message, sequence });
}

async function runMultipleTimes(
  times: number,
  fn: (c: number) => Promise<void>,
  count: number = 0
) {
  if (count === times) return;
  await fn(count + 1);
  await wait(1000);
  runMultipleTimes(times, fn, count + 1);
}

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
