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

    const emitter = await subscribe(connection, argv);

    const finishPromise = new Promise<void>(async (resolve, reject) => {
      emitter.on("finish", resolve);
    });

    publish(connection, argv);

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

/**
 * この関数の完了（戻り値となるPromiseがresolveすること）は「購読を開始したこと」を表す。
 * そのためEmitterを用いて「購読を完了したこと」を返すこととする。
 *
 * @param connection
 * @param argv
 * @returns
 */
async function subscribe(connection: mqtt.MqttClientConnection, argv: Args) {
  const emitter = new events.EventEmitter();

  const decoder = new TextDecoder("utf8");

  await connection.subscribe(
    argv.topic,
    mqtt.QoS.AtLeastOnce,
    (
      topic: string,
      payload: ArrayBuffer,
      dup: boolean,
      qos: mqtt.QoS,
      retain: boolean
    ) => {
      const json = decoder.decode(payload);
      console.log(
        `Publish received. topic:"${topic}" dup:${dup} qos:${qos} retain:${retain}`
      );
      console.log(json);
      const message = JSON.parse(json);

      if (message.sequence == argv.count) {
        emitter.emit("finish");
      }
    }
  );

  return emitter;
}

function publish(connection: mqtt.MqttClientConnection, argv: Args) {
  for (let op_idx = 0; op_idx < argv.count; ++op_idx) {
    const publish = async () => {
      const msg = {
        message: argv.message,
        sequence: op_idx + 1,
      };
      const json = JSON.stringify(msg);
      connection.publish(argv.topic, json, mqtt.QoS.AtLeastOnce);
    };
    setTimeout(publish, op_idx * 1000);
  }
}
