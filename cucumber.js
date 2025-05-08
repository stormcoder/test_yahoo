module.exports = {
    default: {
      requireModule: ['ts-node/register'],
      require: ['src/steps/*.ts'],
      format: ['progress-bar', 'html:cucumber-report.html'],
      paths: ['src/features/*.feature']
    }
  }
  