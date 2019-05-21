BASE_DIST          = ${PWD}/build/npm
HELP_NPM           = etc/makefiles/npm-help.md

.PHONY: help-npm
help-npm: help-impl-npm ## Print makefile update commands
	@ if [ -f "${HELP_NPM}" ]; then \
		cat "${HELP_NPM}" ; \
	fi

# The CI steps call this (e.g. Google Cloud Build) 
.PHONY: npm-publish
npm-publish: guard-env-NPM_TOKEN ###npm NPM publish the packages (metaframe+metapage)
	@echo "PUBLISHING npm version $$(cat package.json | jq -r '.version')"
	@rm -rf ${BASE_DIST}
	@npx webpack --mode=production
	@for name in "metaframe" "metapage" ; do \
		mkdir -p ${BASE_DIST}/$${name} ; \
		cat package.json | jq ". .name = \"$${name}\"" > ${BASE_DIST}/$${name}/package.json ; \
		cp README-PACKAGE.md ${BASE_DIST}/$${name}/README.md ; \
		cp LICENSE ${BASE_DIST}/$${name}/ ; \
		echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> ${BASE_DIST}/$${name}/.npmrc ; \
		pushd ${BASE_DIST}/$${name} ; \
		npm publish . || exit 1 ; \
		popd ; \
	done

.PHONY: publish-update-jekyll-script-links
publish-update-jekyll-script-links: ###npm Get the version from package.json and update hard-coded fields elsewhere
	export VERSION=$$(cat package.json | jq -r '.version') && \
		sed -i "s#[0-9]\+\.[0-9]\+\.[0-9]\+#$${VERSION}#g" docs/_includes/metaframe_lib_script.html && \
		sed -i "s#[0-9]\+\.[0-9]\+\.[0-9]\+#$${VERSION}#g" docs/_includes/metapage_lib_script.html && \
		printf "metaframe: \"$${VERSION}\"\nmetapage: \"$${VERSION}\"\n" > docs/_data/lib_versions.yml


# Bump the npm+git-tag version
NEW_VERSION ?= patch
# https://docs.npmjs.com/cli/version.html
.PHONY: publish-new-version
publish-new-version: guard-env-NEW_VERSION ###npm npm version, git tag, and push to release a new version and publish docs
	npm version ${NEW_VERSION}