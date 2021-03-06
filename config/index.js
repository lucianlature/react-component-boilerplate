'use strict';
var path = require('path');

var webpack = require('webpack');
var merge = require('./merge');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var pkg = require('../package.json');

var ROOT_PATH = path.resolve(__dirname, '..');
var DEMO_DIR = 'demo';
var config = {
    paths: {
        dist: path.join(ROOT_PATH, 'dist'),
        lib: path.join(ROOT_PATH, 'lib'),
        demo: path.join(ROOT_PATH, DEMO_DIR),
        demoIndex: path.join(ROOT_PATH, DEMO_DIR, '/index'),
    },
    filename: 'boilerplate',
    library: 'Boilerplate',
    demoDirectory: DEMO_DIR,
};

var mergeDemo = merge.bind(null, {
    exports: {
        entry: [
            config.paths.demoIndex,
        ],
        resolve: {
            extensions: ['', '.js', '.jsx', '.md', '.css', '.png', '.jpg'],
        },
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loaders: ['style', 'css'],
            },
            {
                test: /\.md$/,
                loader: 'html!highlight!markdown',
            },
            {
                test: /\.png$/,
                loader: 'url?limit=100000&mimetype=image/png',
                include: config.paths.demo,
            },
            {
                test: /\.jpg$/,
                loader: 'file',
                include: config.paths.demo,
            },
            {
                test: /\.json$/,
                loader: 'json',
            },
        ]
    }
});

exports.dev = mergeDemo({
    port: 3000,
    devtool: 'eval',
    entry: [
        'webpack-dev-server/client?http://0.0.0.0:3000',
        'webpack/hot/only-dev-server',
        config.paths.demoIndex,
    ],
    output: {
        path: __dirname,
        filename: 'bundle.js',
        publicPath: '/' + config.demoDirectory + '/'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development'),
            }
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
    ],
    module: {
        preLoaders: [
          {
            test: /\.jsx?$/,
            loader: 'eslint',
            include: [config.paths.demo, config.paths.lib],
          }
        ],
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['react-hot', 'babel'],
                include: [config.paths.demo, config.paths.lib],
            },
        ]
    }
});

exports.ghpages = mergeDemo({
    entry: [
        config.paths.demoIndex,
    ],
    output: {
        path: './gh-pages',
        filename: 'bundle.js',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                // This has effect on the react lib size
                'NODE_ENV': JSON.stringify('production'),
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
        }),
        new HtmlWebpackPlugin({
            title: pkg.name + ' - ' + pkg.description
        }),
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel'],
                include: [config.paths.demo, config.paths.lib],
            }
        ]
    }
});

var mergeDist = merge.bind(null, {
    devtool: 'source-map',
    output: {
        path: config.paths.dist,
        libraryTarget: 'umd',
        library: config.library,
    },
    entry: config.paths.lib,
    externals: {
        react: 'react',
        'react/addons': 'react/addons'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel'],
                include: config.paths.lib,
            }
        ]
    }
});

exports.dist = mergeDist({
    output: {
        filename: config.filename + '.js',
    },
});

exports.distMin = mergeDist({
    output: {
        filename: config.filename + '.min.js',
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
        }),
    ],
});
