#!/usr/bin/env bash
set -e

python::version() {
  echo "Python version:"
  echo $(python3 -c 'import sys; print(sys.version_info)')
  ret=`python3 -c 'import sys; v = sys.version_info; print("%i" % (v.major <3 or v.major==3 and v.minor<5));'`
  if [ $ret != 0 ]; then
    echo "Python version checking failed: minimum requirement is v3.5 (3.6 or above is recommended)"
    exit 1
  fi
}

node::version() {
  echo "Node version:"
  node --version
  ret=$(node -e 'console.log(process.versions.node.split(".")[0] >= 7 ? 0 : 1)')
  if [ $ret != 0 ]; then
    echo "Node.js version checking failed: minimum requirement is v7 (8 or above is recommended)"
    exit 1
  fi
}

main() {
  node::version
  echo
  python::version
}

main "$@"
