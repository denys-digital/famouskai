# Test Offline

## Protocole

### Phase 1

- ouvrir Famouskai avec un fichier
- couper internet
- modifier ce fichier à l'extérieur via un autre éditeur 
- enregistrer cette modification
- modifier ce fichier dans Famouskai
- tenter la sauvegarde dans Famouskai
- valider la popup de détection du conflit
- ouverture de Diffskai à vide sans le fichier
- récupérer les 2 logs de console
- purger les 2 consoles
- fermer Diffskai

### Phase 2

- remettre internet
- tenter la sauvegarde dans Famouskai
- valider la popup de détection du conflit
- ouverture de Diffskai à vide sans le fichier
- récupérer les 2 logs de console
- procéder au merge
- sauvegarder dans Diffskai

## Log de la phase 1

- erreur dans la console de Famouskai :
```
index.html:1757 Access to fetch at 'file:///media/fuse/drivefs-0c9ff3a5d784ac3f0f47e2b074e8f2cc/root/_%F0%9F%9A%80%20Projets/0.%20famouskai-editor%20-%20pwa-cloudflare/%F0%9F%A6%8A%20famouskai-editor/sw.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: chrome, chrome-extension, chrome-untrusted, data, http, https, isolated-app.
index.html:1429  GET file:///media/fuse/drivefs-0c9ff3a5d784ac3f0f47e2b074e8f2cc/root/_%F0%9F%9A%80%20Projets/0.%20famouskai-editor%20-%20pwa-cloudflare/%F0%9F%A6%8A%20famouskai-editor/sw.js net::ERR_FAILED
(anonyme) @ index.html:1429
index.html:1393 Service Worker Error: TypeError: Failed to register a ServiceWorker: The URL protocol of the current origin ('null') is not supported.
    at index.html:1391:41
[Violation] Forced reflow while executing JavaScript took 38ms
```

- erreur dans la console de Diffskai :
```
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/loader.js
The FetchEvent for "https://famouskai.pages.dev/vendor/monaco-editor/loader.js" resulted in a network error response: the promise was rejected.
sw.js:114  Uncaught (in promise) TypeError: Failed to fetch
    at sw.js:114:32
(anonyme) @ sw.js:114
Promise.then
(anonyme) @ sw.js:112
loader.js:1  Failed to load resource: net::ERR_FAILED
tool-diffskai.html?conflict=1788929709778:152 Uncaught ReferenceError: require is not defined
    at tool-diffskai.html?conflict=1788929709778:152:9
(anonyme) @ tool-diffskai.html?conflict=1788929709778:152
```

## Log de la phase 1

- erreur dans la console de Famouskai :
```
Service Worker was updated because "Update on reload" was checked in the DevTools Application panel.
sw.js:78 famouskai-v21 caching started...
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/loader.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/editor/editor.main.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/json.worker-BizpAl9O.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/css.worker-CyhWkhHo.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/html.worker-CA3iAimZ.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/ts.worker-2QLmBukE.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/nls.messages-loader.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/index-CBVt3dzv.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/monaco.contribution-9cKT3C7t.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/editor-KLE6jdfb.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/monaco.contribution-BgRy6xDf.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/monaco.contribution-BE88ZNGY.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/monaco.contribution-BPhsneLd.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/toggleHighContrast-qGX7E9o7.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/basic-languages/monaco.contribution.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/editorWorkerHost-fVE1cjcC.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/editor/editor.main.css
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/html-j_7ZTNRU.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/htmlMode-27by_KM4.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/assets/editor.worker-lj3bdIIn.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/workers-BBttULjf.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/lspLanguageFeatures-BIkJOWLw.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/javascript-DTJl4Jn1.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/css-CaeNmE3S.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/typescript-_2t_511t.js
```

- erreur dans la console de Diffskai :
```
Service Worker was updated because "Update on reload" was checked in the DevTools Application panel.
sw.js:78 famouskai-v21 caching started...
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/loader.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/editor/editor.main.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/json.worker-BizpAl9O.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/css.worker-CyhWkhHo.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/html.worker-CA3iAimZ.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/ts.worker-2QLmBukE.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/nls.messages-loader.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/index-CBVt3dzv.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/monaco.contribution-9cKT3C7t.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/editor-KLE6jdfb.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/monaco.contribution-BgRy6xDf.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/monaco.contribution-BE88ZNGY.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/monaco.contribution-BPhsneLd.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/toggleHighContrast-qGX7E9o7.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/basic-languages/monaco.contribution.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/editorWorkerHost-fVE1cjcC.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/editor/editor.main.css
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/html-j_7ZTNRU.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/htmlMode-27by_KM4.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/assets/editor.worker-lj3bdIIn.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/workers-BBttULjf.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/lspLanguageFeatures-BIkJOWLw.js
tool-diffskai.html?conflict=1788930466305:1 Refused to execute script from 'https://famouskai.pages.dev/vendor/monaco-editor/lspLanguageFeatures-BIkJOWLw.js' because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.
loader.js:172 Uncaught (in promise) Error: [object Event]
    at Object.y [as ensureError] (loader.js:172:13)
    at c._createLoadError (loader.js:1056:16)
    at c._onLoadError (loader.js:1060:19)
    at l (loader.js:1139:37)
    at Object.errorback (loader.js:1159:27)
    at y.triggerErrorback (loader.js:394:44)
    at loader.js:383:18
    at HTMLScriptElement.d (loader.js:406:11)
y @ loader.js:172
_createLoadError @ loader.js:1056
_onLoadError @ loader.js:1060
l @ loader.js:1139
(anonyme) @ loader.js:1159
triggerErrorback @ loader.js:394
(anonyme) @ loader.js:383
d @ loader.js:406
script
load @ loader.js:424
load @ loader.js:379
l @ loader.js:1150
_loadModule @ loader.js:1164
_resolve @ loader.js:1238
defineModule @ loader.js:984
p @ loader.js:1297
(anonyme) @ htmlMode-27by_KM4.js:1
PendingScript
load @ loader.js:431
load @ loader.js:379
l @ loader.js:1150
_loadModule @ loader.js:1164
_resolve @ loader.js:1238
defineModule @ loader.js:984
_relativeRequire @ loader.js:1008
e @ loader.js:1118
(anonyme) @ monaco.contribution-BgRy6xDf.js:1
S @ monaco.contribution-BgRy6xDf.js:1
(anonyme) @ monaco.contribution-BgRy6xDf.js:1
(anonyme) @ editor-KLE6jdfb.js:831
_deliver @ editorWorkerHost-fVE1cjcC.js:7
_deliverQueue @ editorWorkerHost-fVE1cjcC.js:7
fire @ editorWorkerHost-fVE1cjcC.js:7
requestRichLanguageFeatures @ editor-KLE6jdfb.js:809
_setLanguage @ editor-KLE6jdfb.js:234
setLanguage @ editor-KLE6jdfb.js:234
NJ @ editor-KLE6jdfb.js:830
(anonyme) @ tool-diffskai.html?conflict=1788930466305:316
await in (anonyme)
_invokeFactory @ loader.js:797
complete @ loader.js:806
_onModuleComplete @ loader.js:1271
_onModuleComplete @ loader.js:1278
_onModuleComplete @ loader.js:1278
_onModuleComplete @ loader.js:1278
_onModuleComplete @ loader.js:1278
_resolve @ loader.js:1240
defineModule @ loader.js:984
p @ loader.js:1297
(anonyme) @ editorWorkerHost-fVE1cjcC.js:1
PendingScript
load @ loader.js:431
load @ loader.js:379
l @ loader.js:1150
_loadModule @ loader.js:1164
_resolve @ loader.js:1238
defineModule @ loader.js:984
p @ loader.js:1297
(anonyme) @ editor-KLE6jdfb.js:1
PendingScript
load @ loader.js:431
load @ loader.js:379
l @ loader.js:1150
_loadModule @ loader.js:1164
_resolve @ loader.js:1238
defineModule @ loader.js:984
p @ loader.js:1297
(anonyme) @ editor.main.js:1
PendingScript
load @ loader.js:431
load @ loader.js:379
l @ loader.js:1150
_loadModule @ loader.js:1164
_resolve @ loader.js:1238
defineModule @ loader.js:984
r @ loader.js:1312
(anonyme) @ tool-diffskai.html?conflict=1788930466305:226
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/javascript-DTJl4Jn1.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/css-CaeNmE3S.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/typescript-_2t_511t.js
sw.js:108 📌 Monaco Request: https://famouskai.pages.dev/vendor/monaco-editor/editor/editor.main.css
```
