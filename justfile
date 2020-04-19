# just docs: https://github.com/casey/just

help:
    @just --list
    @echo "{{HELP}}"

# create the single iterm window with all the views https://github.com/TomAnthony/itermocil
cli:
    itermocil --here --layout .iTermocil.yml

# Idempotent. The local compose stack requires some host setup. If any of this fails, see the underlying commands
@init:
    if [ ! -f apps/https/conf.d/certs/cert-key.pem ]; then \
        just _mkcert; \
    fi

clean:
    just libs/clean
    rm -rf apps/https/conf.d/certs/*

# Run the stack, defaulting to all. Just target "jekyll" for a minimal server  metapage-app
up +args='--remove-orphans -d': init
    docker-compose up {{args}}

# Bring the stack down
down +args='':
    docker-compose down {{args}}

build +args='':
    docker-compose build {{args}}


# DEV: generate TLS certs for HTTPS over localhost https://blog.filippo.io/mkcert-valid-https-certificates-for-localhost/
_mkcert: clean
    mkdir -p apps/https/conf.d/certs/
    cd apps/https/conf.d/certs/ && mkcert -cert-file cert.pem -key-file cert-key.pem metapages.local localhost
    @echo "Don't forget to add '127.0.0.1 metapages.local' to /etc/hosts"





# https://docs.npmjs.com/cli/version.html
# npm version, git tag, and push to release a new version and publish docs
# VERSION = major | minor | patch. New version publishing is two steps but then completely automated!
version-new-publish VERSION='patch' dirtyok='yes': _require-master-branch _check-no-debug-flags-set
    @# Fail if uncomitted changes
    if [ "{{dirtyok}}" != "yes" ]; then git diff-index --quiet HEAD --; fi

    @# make a copy of the docs and update the current docs version
    just _archive-current-docs

    @# actually bump the libs version. # disabled --no-git-tag-version version because the ordering screwed up the cloud tests
    cd libs && npm version {{VERSION}}

    @# change the version in the API docs
    just _set-api-docs-current-version

    @# this commmit will be picked up by the build process and the npm libraries published
    git add -u ; git commit -m "v`just version`" && git tag v`just version` && git push && git push origin v`just version`

    @echo "version `just version` pushed and queued for publishing (via cloudbuild.yml)"
    @echo "IMPORTANT: jekyll needs to know about the new version, and this cannot happen in an automated way because it breaks the cloud tests.\So after the npm packages are published, run\njust _post-version-new-publish"

_post-version-new-publish:
    just version-update-local-files

_require-master-branch:
    if [ "`git rev-parse --symbolic-full-name --abbrev-ref HEAD`" != "master" ]; then exit 1; fi

_set-api-docs-current-version:
    sed -i "s/API Reference v.*/API Reference v`just version`/g" docs/pages/04_api.md
    sed -i "s#title: api_.*.*#title: api_`just version`/#g" docs/pages/04_api.md

# Make sure that we're not compiling in any debug parameters
_check-no-debug-flags-set:
    @if grep -q '^-D jsondiff' libs/build-base.hxml; then \
        echo "-D jsondiff found, please comment out"; exit 1; \
    fi
    @if grep -q 'debug: true' libs/webpack.config.js; then \
        echo "webpack: 'debug: true' found, set to false"; exit 1; \
    fi

_archive-current-docs:
    cp docs/pages/04_api.md docs/_versions/api_`just version`.md
    sed -i "s/nav_order:.*/nav_exclude: true/g" docs/_versions/api_`just version`.md
    sed -i "s#permalink:.*#permalink: /api/`just version`/\nversion: `just version`#g" docs/_versions/api_`just version`.md
    git add docs/_versions/api_`just version`.md

version-help:
    @echo "New version release steps"
    @echo "1. just publish-new-version"
    @echo "2. Wait until libs are published"
    @echo "3. just _post-version-new-publish"

# Idempotent version update where they are used
version-update-local-files:
    docker-compose run shell-haxe just _versions-write-versions-to-jekyll
    git add -u ; git commit -m "DOCS: Updating current library to version: `just version`" && git push
    @# i cannot remember why i need this step, it *is* important, fill in later why
    @rm -rf libs/build

# Get current NPM version
version:
    @cat libs/package.json | jq -r '.version'

# Damn it happens. Untagging/deprecating, and some possible manual tweaks.
version-remove VERSION:
    @if [[ {{VERSION}} == v* ]]; then echo "version must not start with the v" && exit 1; fi
    git push origin :v{{VERSION}} || :
    git tag -d v{{VERSION}} || :
    npm deprecate metapage@{{VERSION}} "Deprecating via automated version-remove" || :
    npm deprecate metaframe@{{VERSION}} "Deprecating via automated version-remove" || :
    @echo "If this version should be ignored in tests, add to libs/test/versions.js versions = versions.filter((v) => {"
    @echo "package.json: adjust accordingly, you might have to manually decrement or change the version"

_require-docker:
    @if [ ! -f /.dockerenv ]; then \
        echo "First run just sh" && exit 1 ; \
    fi

########################################
# DEPRECATED

# Commit the current staged/unstaged commits with the current libs/package.json version
_DEPRECATED_version-commit:
    git add -u ; git commit -m "v`just version`"
    git tag v`just version`

HELP := '
Reminders:
    Developing app.metapages.org locally? Modify docs/_data/urls.yml
    Have you run:
    just _post-version-new-publish

    Last task and commands:
    - converted to typescript! just libs/test needs to properly test, and package.
    - commands: just up, make sure all docker-compose paths are correct, then get tests working.
    - clean up, and copy test html to the right place
'
