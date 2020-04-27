#!/usr/bin/env bash

target='src/engine'

if [ ! -L ${target} ] ; then
  ln -s ../../engine/src ${target}
fi
