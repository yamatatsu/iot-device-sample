import yargs from "yargs";

export const cli = yargs
  .option("client_id", {
    alias: "C",
    description: "Client ID for MQTT connection.",
    type: "string",
    required: false,
  })
  .option("topic", {
    alias: "t",
    description: "STRING: Targeted topic",
    type: "string",
    default: "test/topic",
  })
  .option("count", {
    alias: "n",
    default: 10,
    description:
      "Number of messages to publish/receive before exiting. " +
      "Specify 0 to run forever.",
    type: "number",
    required: false,
  })
  .option("use_websocket", {
    alias: "W",
    default: false,
    description:
      "To use a websocket instead of raw mqtt. If you " +
      "specify this option you must specify a region for signing, you can also enable proxy mode.",
    type: "boolean",
    required: false,
  })
  .option("signing_region", {
    alias: "s",
    default: "us-east-1",
    description:
      "If you specify --use_websocket, this " +
      "is the region that will be used for computing the Sigv4 signature",
    type: "string",
    required: false,
  })
  .option("proxy_host", {
    alias: "H",
    description:
      "Hostname for proxy to connect to. Note: if you use this feature, " +
      "you will likely need to set --ca_file to the ca for your proxy.",
    type: "string",
    required: false,
  })
  .option("proxy_port", {
    alias: "P",
    default: 8080,
    description: "Port for proxy to connect to.",
    type: "number",
    required: false,
  })
  .option("message", {
    alias: "M",
    description: "Message to publish.",
    type: "string",
    default: "Hello world!",
  })
  .option("verbosity", {
    alias: "v",
    description: "BOOLEAN: Verbose output",
    type: "string",
    default: "NONE",
    choices: ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE", "NONE"],
  })
  .help()
  .alias("help", "h")
  .showHelpOnFail(false);
