# Docker Images and Layers

A Docker image is a stack of read-only layers. Each instruction in a Dockerfile that changes the filesystem, such as RUN, COPY, or ADD, produces a new layer containing only the files that instruction changed. Layers are content-addressed: each is stored under a digest of its contents, so identical layers are shared between images and downloaded only once.

When a container starts, the engine stacks the image layers and adds one thin writable layer on top for that container alone. Reads go down through the stack until the file is found. Writing to a file that lives in a lower layer copies it up into the writable layer first, which is why the mechanism is called copy-on-write. Deleting the container discards its writable layer; the image layers are untouched and remain shared with every other container from the same image.

Layer ordering is a practical performance concern because Docker caches each layer keyed by the instruction and its inputs. If any layer changes, that layer and every layer after it must be rebuilt. Good Dockerfiles therefore put instructions that change rarely, such as installing system packages, early in the file, and instructions that change often, such as copying application source code, near the end, so day-to-day rebuilds reuse most of the cache.

A multi-stage build uses several FROM statements in one Dockerfile. The first stage might compile a program with a full toolchain, and the final stage starts from a small base image and copies only the built artifact out of the first stage. The shipped image then contains neither the compiler nor the source tree, which makes it smaller and reduces its attack surface.

Images are named by repository and tag, but a tag is only a movable label. The digest, written as sha256 followed by the hash, identifies one exact image manifest, and pinning by digest guarantees that every machine runs bit-identical content.
