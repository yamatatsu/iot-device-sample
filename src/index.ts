import { cli } from "./cli";
import main from "./main";
import { ENDPOINT, CA_FILE, CERT, KEY } from "./env";

cli
  .command(
    "*",
    false,
    () => {},
    main({
      endpoint: ENDPOINT,
      ca_file: CA_FILE,
      cert: CERT,
      key: KEY,
    })
  )
  .parse();
