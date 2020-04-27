#!/usr/bin/env bash

dependencies="engine"

for dependency in $dependencies; do
  target="src/${dependency}"
  if [ ! -L "${target}" ] ; then
    ln -s ../../"${dependency}"/src "${target}"
  fi
done
