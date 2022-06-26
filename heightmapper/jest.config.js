/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(data-uri-to-buffer|fetch-blob|formdata-polyfill|node-fetch))',
  ],
}
