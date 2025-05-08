module.exports = {
    default: {
      requireModule: ['ts-node/register'],
      require: [
        'src/steps/*.ts',
        'src/support/*.ts'  // Add support directory
    ],
    format: ['progress-bar', 'html:cucumber-report.html'],
    paths: ['src/features/*.feature']
    }
  }
  