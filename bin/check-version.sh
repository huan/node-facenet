#!/usr/bin/env bash
set -e

python::version() {
  echo $(python3 -c 'import sys; print(sys.version_info)')
  ret=`python3 -c 'import sys; v = sys.version_info; print("%i" % (v.major <3 or v.major==3 and v.minor<5));'`
  if [ $ret != 0 ]; then
    echo "Python version chec failed: minimum requirement is v3.5 (3.6 or above is recommended)"
    exit 1
  fi
}

main() {
  python::version
}

main "$@"
