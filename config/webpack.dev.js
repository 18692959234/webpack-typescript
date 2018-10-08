const path = require("path");
const uglify = require('uglifyjs-webpack-plugin'); //js压缩
const htmlPlugin = require("html-webpack-plugin"); //打包html
const extractTextPlugin = require("extract-text-webpack-plugin") //css  img 分离
const AutoPrefixer = require('autoprefixer'); //css3消除前缀
module.exports = {
	mode: "development",
	entry: {
		main: "./src/js/main.js"
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, '../dist'),
	},
	module: {
		rules: [
			//css loader
			{
				test: /\.css$/,
				use: extractTextPlugin.extract({
					fallback: "style-loader",
					use: [{
							loader: "css-loader"
						},
						{
							loader: 'postcss-loader',
							options: {
								ident: 'postcss', // 表示下面的插件是对postcss使用的
								plugins: [
									AutoPrefixer(),
								]
							}
						}
					],

					publicPath: '../'
				}),
			},

			//图片 loader
			{
				test: /\.(png|jpg|gif|jpeg)/, //是匹配图片文件后缀名称
				use: [{
					loader: 'url-loader', //是指定使用的loader和loader的配置参数
					options: {
						limit: 500, //是把小于500B的文件打成Base64的格式，写入JS
						outputPath: 'images/', //打包后的图片放到images文件夹下
					}
				}]
			},
			//html loader
			{
				test: /\.(htm|html)$/i,
				use: ['html-withimg-loader']
			},
			//less loader
			{
				test: /\.less$/,
				use: extractTextPlugin.extract({
					use: [{
							loader: "css-loader"
						},
						{
							loader: "less-loader"
						},
						{
							loader: "postcss-loader"
						}

					],
					publicPath: '../',
					// use style-loader in development
					fallback: "style-loader"
				})

			},
			////babel 配置
			{
				test: /\.(jsx|js)$/,
				use: {
					loader: 'babel-loader',
				},
				exclude: /node_modules/
			},
			{
				test: /\.ts$/,
				use: "ts-loader"
			},
			{
				enforce: 'pre',
				test: /\.js$/,
				loader: "source-map-loader"
			},
			{
				enforce: 'pre',
				test: /\.tsx?$/,
				use: "source-map-loader"
			}

		]
	},
	//解析查找 TypeScript 模块时该检索哪些文件扩展名
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},

	//插件，用于生产模版和各项功能
	plugins: [
		// extractLess,
		AutoPrefixer,
		new extractTextPlugin("css/index.css"), //这里的/css/index.css 是分离后的路径
		new uglify(), //js压缩插件
		new htmlPlugin({
			minify: { //是对html文件进行压缩
				removeAttributeQuotes: true //removeAttrubuteQuotes是却掉属性的双引号。
			},
			hash: true, //为了开发中js有缓存效果，所以加入hash，这样可以有效避免缓存JS。
			template: './src/index.html' //是要打包的html模版路径和文件名称。

		})
	],

	devServer: {
		contentBase: path.resolve(__dirname, '../dist'),
		host: '192.168.1.115',
		compress: true,
		port: 8888,
		proxy: {
			"/api": {
				target: "http://test.frp.dzkandian.com",
				pathRewrite: {
					'^/api': '/' //这里理解成用‘/api’代替target里面的地址，后面组件中我们掉接口时直接用api代替 比如我要调用'http://40.00.100.100:3002/user/add'，直接写‘/api/user/add’即可
				},

				secure: false,
				changeOrigin: true

			}
		}
	}
}