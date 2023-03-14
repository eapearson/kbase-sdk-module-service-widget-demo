# The makefile is for catalog compatibility
# All functional automation scripting is located in Taskfile

.PHONY: test build

default: compile

all: compile build 

compile:
	# nothing to see here
	@echo Nothing to compile?

build:
	# Build widgets and place in build/widgets
	./Taskfile build-status-widget
	./Taskfile build-workspace-status-widget
	./Taskfile build-pdb-widget
	# The rest is done by the Dockerfile
	# is this really necessary?
	# chmod +x scripts/entrypoint.sh