#!/bin/bash

if [ -d "$1" ]; then
  echo 1
fi

if [ ! -d "$1" ]; then
  echo 0
fi
