export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.CYie9zoZ.js",app:"_app/immutable/entry/app.BL9qUEef.js",imports:["_app/immutable/entry/start.CYie9zoZ.js","_app/immutable/chunks/3pXMxo2Z.js","_app/immutable/chunks/mdvGq3lZ.js","_app/immutable/chunks/CWuZ4Z7h.js","_app/immutable/entry/app.BL9qUEef.js","_app/immutable/chunks/mdvGq3lZ.js","_app/immutable/chunks/DOFgpHCO.js","_app/immutable/chunks/CMXY7JCy.js","_app/immutable/chunks/CgZkDfG6.js","_app/immutable/chunks/CWuZ4Z7h.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/presentations",
				pattern: /^\/api\/presentations\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/presentations/_server.ts.js'))
			},
			{
				id: "/api/presentations/[id]",
				pattern: /^\/api\/presentations\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/presentations/_id_/_server.ts.js'))
			},
			{
				id: "/api/presentations/[id]/slides",
				pattern: /^\/api\/presentations\/([^/]+?)\/slides\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/presentations/_id_/slides/_server.ts.js'))
			},
			{
				id: "/api/presentations/[id]/slides/[slideId]",
				pattern: /^\/api\/presentations\/([^/]+?)\/slides\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"slideId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/presentations/_id_/slides/_slideId_/_server.ts.js'))
			},
			{
				id: "/dashboard",
				pattern: /^\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/editor/[id]",
				pattern: /^\/editor\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
