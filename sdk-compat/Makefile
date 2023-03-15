# The makefile is for catalog compatibility
# All functional automation scripting is located in Taskfile

.PHONY: test build

default: compile

all: compile build 

compile:
	# nothing to see here
	@echo Building widgets
	./Taskfile build-status-widget
	./Taskfile build-workspace-status-widget
	./Taskfile build-pdb-widget

build:
	# Build widgets and place in build/widgets
	# The rest is done by the Dockerfile
	# is this really necessary?
	# chmod +x scripts/entrypoint.sh