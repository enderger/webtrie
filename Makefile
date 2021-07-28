SHARED_ARGS:=--unstable --import-map=import_map.json

CLIENT_MODULE:=src/cli.ts
CLIENT_ARGS:=$(SHARED_ARGS) --allow-net

SERVER_MODULE:=src/server.ts
SERVER_ARGS:=$(SHARED_ARGS) --allow-net --allow-read --allow-write

TEST_ARGS:=$(SHARED_ARGS) --allow-all

install-client:
	deno install $(CLIENT_ARGS) -n webtrie-cli "$(CLIENT_MODULE)"

install-server:
	deno install $(SERVER_ARGS) -n webtrie-server "$(SERVER_MODULE)"

test:
	deno test $(TEST_ARGS)
