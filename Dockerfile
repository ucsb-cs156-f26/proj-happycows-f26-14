# ---- Stage 1: build the app (backend + frontend) ----
# Maven is pinned here (3.9.16) instead of installed from apt, which shipped an old Maven whose
# bundled Guava triggers the "sun.misc.Unsafe" warnings on JDK 24+. The Maven version is the one in the image tag.
FROM maven:3.9.16-eclipse-temurin-25-noble AS builder

WORKDIR /home/app

# Layering: files that change rarely are copied (and their dependencies downloaded) first, so Docker can
# reuse those layers on later builds. The cache mounts keep ~/.m2 and ~/.npm between builds.

# 1. Backend dependencies (only re-run when pom.xml changes)
COPY pom.xml .
RUN --mount=id=156-base-mvn,type=cache,target=/root/.m2/repository \
    mvn dependency:go-offline -B

# 2. Node, npm and frontend dependencies (only re-run when package*.json changes)
COPY frontend/package-lock.json frontend/package.json frontend/
RUN --mount=id=156-base-mvn,type=cache,target=/root/.m2/repository \
    --mount=id=156-base-npm,type=cache,target=/root/.npm \
    mvn -Pproduction \
      com.github.eirslett:frontend-maven-plugin:install-node-and-npm@install-node-and-npm \
      com.github.eirslett:frontend-maven-plugin:npm@npm-install -B

# 3. Everything else, then build the production jar.
# frontend.dependency.skip=true: step 2 already ran "npm ci", so don't run it again.
# (There is no "clean" here: a fresh image has nothing to clean, and "clean" would delete the node
# install from step 2 in target/.)
COPY . .
RUN --mount=id=156-base-mvn,type=cache,target=/root/.m2/repository \
    mvn -Pproduction -DskipTests -Dfrontend.dependency.skip=true package -B

# ---- Stage 2: minimal runtime image (just a JRE, the jar and the startup script) ----
FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

RUN apk add --no-cache bash curl

ENV PRODUCTION=true

COPY --from=builder /home/app/startup.sh .
COPY --from=builder /home/app/target/*.jar app.jar

ENTRYPOINT ["./startup.sh", "app.jar"]
