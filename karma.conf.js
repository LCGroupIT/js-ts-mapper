var path = require('path');
var tsconfig = require('./tsconfig.spec.json');
module.exports = function (config) {
    config.set({
        browsers: ['Chrome', 'IE10'],
        colors: true,
        coverageReporter: {
            dir: './',
            reporters: [{
                type: 'lcov',
                subdir: 'coverage'
            }]
        },
        customLaunchers: {
            IE10: {
                base: 'IE',
                'x-ua-compatible': 'IE=EmulateIE10'
            },
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
        files: [
            'karma.entry.js'
        ],
        frameworks: ['jasmine'],
        preprocessors: {
            'karma.entry.js': ['webpack', 'sourcemap'],
            'src/**/*.js': ['coverage']
        },
        reporters: ['spec', 'coverage'],
        singleRun: true,
        webpack: {
            mode: 'development',
            devtool: 'inline-source-map',
            module: {
                rules: [{
                        exclude: [path.resolve(__dirname, 'node_modules')],
                        include: [
                            path.resolve(__dirname, 'src'),
                            path.resolve(__dirname, 'tests')
                        ],
                        loader: 'ts-loader',
                        test: /.*(?!\.d\.ts)|(\.ts)$/,
                        options: tsconfig
                    },
                    {
                        include: [
                            path.resolve(__dirname, 'src')
                        ],
                        loader: 'istanbul-instrumenter-loader',
                        test: /\.ts$/,
                        enforce: 'post'
                    }
                ]
            },
            resolve: {
                extensions: ['.ts', '.tsx', '.json', '.js'],
                modules: [
                    'node_modules'
                ]
            }
        },
        webpackServer: {
            noInfo: true,
            noLog: true
        }
    });
    if (process.env.TRAVIS) {
        config.browsers = ['Chrome_travis_ci'];
    }
};