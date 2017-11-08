#!/bin/bash
#
set -e

imageName='facenet'

optRm='--rm'
[ -n "$CIRCLECI" ] && optRm='--rm=false'

declare -i ret=0

case "${1:-build}" in
  build)
    echo docker build "$optRm" -t "$imageName" .
    exec docker build "$optRm" -t "$imageName" .

#    echo docker build "$optRm" -t "${imageName}:onbuild" -f Dockerfile.onbuild .
#    exec docker build "$optRm" -t "${imageName}:onbuild" -f Dockerfile.onbuild .

    ret=$?
    ;;

  test)
    echo "bats test/"
    IMAGE_NAME="$imageName" bats test/

    echo docker run -ti "$optRm" -v /dev/shm:/dev/shm "$imageName" test
    exec docker run -ti "$optRm" -v /dev/shm:/dev/shm "$imageName" test
    ret=$?
    ;;

  clean)
    docker ps -a | grep Exited | awk '{print $1}' | xargs docker rm || true
    docker images | grep none | awk '{print $3}' | xargs docker rmi
    ;;

  deploy)
    if [ "$TRAVIS_OS_NAME" == 'linux' ]; then curl -X POST -d '{"from":"travis"}' "$DOCKER_REBUILD_URL"; fi
    ;;

  *)
    echo docker run -ti "$optRm" -v /dev/shm:/dev/shm "$imageName" "$@"
    exec docker run -ti "$optRm" -v /dev/shm:/dev/shm "$imageName" "$@"
    ;;
esac

[ "$ret" -ne 0 ] && {
  echo "ERROR: exec return $ret ???"
  exit $ret
}
