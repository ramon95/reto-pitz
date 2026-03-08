FROM ruby:3.3-slim

WORKDIR /app

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      libpq-dev \
      libyaml-dev \
      pkg-config \
      curl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3001

CMD ["rails", "server", "-p", "3001", "-b", "0.0.0.0"]
