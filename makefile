.PHONY: compile
compile:
	./tools/compile.sh

.PHONY: pack
pack:
	./tools/pack.sh

.PHONY: dist
dist: compile pack

.PHONY: assets
assets:
	./dev/convert.sh

.PHONY: test
test:
	rm -rf test
	unzip dist.zip -d test
