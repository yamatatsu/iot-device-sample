export type Args = {
  client_id?: string;
  topic: string;
  count: number;
  use_websocket: boolean;
  signing_region: string;
  proxy_host?: string;
  proxy_port: number;
  message: string;
  verbosity: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE" | "NONE";
};
