# Thingy
If you're wondering what this thingy is then you've come to the right Readme. This 'thingy', in it's current form, is a message history tracker for Slack. It'll listen for messages and store them in an ElasticSearch DB to allow for easy searching and stuff. It will also track all edits and deletions and perseve them for science.

**NOTE: This is code is still in development, it is not production ready.**

## Requirements
 * ElasticSearch - shocking I know
 * A Slack Team  - also shocking
 * Permission to track everything - You don't actually need this but ¯\\_(ツ )_/¯
 * A Slack Bot Token to use the api
 * A super computer so ElasticSearch, destroyer of RAM can run efficiently.

## Installation
 * Install the required dependencies `npm i`
 * Ensure your ElasticSearch instance is running
 * Add the IP and Host of your ElasticSearch in the config.json
 * Add the required scripts in the `./scripts` folder to your ElasticSearch scripts in `<elasticsearch>/config/scripts`

## Usage
Run the script by going `node ./src/app.js`, I should probably add some better starting stuff... maybe later.

## I think
That's everything. There is also a WebUI to go along with this but I haven't finished that, or started really but it's getting there.
