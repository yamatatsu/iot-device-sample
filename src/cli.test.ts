import { Arguments } from "yargs";
import { cli } from "./cli";
import { Args } from "./types";

test("Normal", (done) => {
  const expected: Arguments<Args> = {
    $0: expect.any(String),
    M: "Hello world!",
    P: 8080,
    W: false,
    _: [],
    count: 10,
    message: "Hello world!",
    n: 10,
    proxy_port: 8080,
    s: "us-east-1",
    signing_region: "us-east-1",
    t: "test/topic",
    topic: "test/topic",
    use_websocket: false,
    v: "NONE",
    verbosity: "NONE",
  };

  cli
    .command("*", false, () => {})
    .parse("", {}, (err, argv, output) => {
      expect({ err, argv }).toEqual({ err: null, argv: expected });
      done();
    });
});
