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

# Bump the npm+git-tag version
# Also update the version in other files that need it
NEW_VERSION ?= patch
.PHONY: npm-publish
npm-publish: guard-env-NEW_VERSION ###npm NPM publish the packages (metaframe+metapage)
	@#npm version ${NEW_VERSION}
	sed -i 's/old-text/new-text/g' docs/_includes/metaframe_lib_script.html
	<script src="https://cdn.jsdelivr.net/npm/metapage@0.0.15/browser.js"></script>
	
