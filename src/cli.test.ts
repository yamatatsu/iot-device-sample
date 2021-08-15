import { Arguments } from "yargs";
import { cli } from "./cli";
import { Args } from "./types";

test("Min Case", (done) => {
  const expected: Arguments<Args> = {
    // client_id: "",
    // C: "",
    topic: "test/topic",
    t: "test/topic",
    count: 10,
    n: 10,
    use_websocket: false,
    W: false,
    signing_region: "us-east-1",
    s: "us-east-1",
    // proxy_host: "",
    // H: "",
    proxy_port: 8080,
    P: 8080,
    message: "Hello world!",
    M: "Hello world!",
    verbosity: "NONE",
    v: "NONE",
    $0: expect.any(String),
    _: [],
  };

  cli
    .command("*", false, () => {})
    .parse("", {}, (err, argv, output) => {
      expect({ err, argv }).toEqual({ err: null, argv: expected });
      done();
    });
});

test("Max Case", (done) => {
  const expected: Arguments<Args> = {
    client_id: "test_client_id",
    C: "test_client_id",
    topic: "test_topic",
    t: "test_topic",
    count: 100,
    n: 100,
    use_websocket: true,
    W: true,
    signing_region: "ap-northeast-1",
    s: "ap-northeast-1",
    proxy_host: "example.com",
    H: "example.com",
    proxy_port: 8000,
    P: 8000,
    message: "test_message",
    M: "test_message",
    verbosity: "DEBUG",
    v: "DEBUG",
    $0: expect.any(String),
    _: [],
  };

  cli
    .command("*", false, () => {})
    .parse(
      "-C test_client_id -t test_topic -n 100 -W -s ap-northeast-1 -H example.com -P 8000 -M test_message -v DEBUG",
      {},
      (err, argv, output) => {
        expect({ err, argv }).toEqual({ err: null, argv: expected });
        done();
      }
    );
});
