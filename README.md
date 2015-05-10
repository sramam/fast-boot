# fast-boot
Caching of the FS location of node modules between node process startups

The module hooks into the node module module and changes the ```_resolveFilename``` method, caching the files it finds
in order to improve node loading performance. Node does tons of file lookups as it resolves modules and by default
it does not cache the found file locations.

node-module-location-cache caches only location of files in the ```node_modules``` directory.

by default, node-module-location-cache will save the modules locations cache under node_modules 10 seconds after
a module was loaded. You can also force it to save the cache or load the cache using the API methods

Usage:

nodeModuleCache.start([opts])
===

Starts the caching

```
var nodeModuleCache = require("fast-boot");
nodeModuleCache.start();
```

Start accepts an options parameter with two options
   * ```cacheFile``` - alternate cache file. Defaults to ```'./node_modules/module-locations-cache.json'```
   * ```cacheKiller``` - used to invalidate the cache. Normally one will pass the application version number assuming that a different version
   may have different version of dependencies making modules located in different locations. The default is the version number from package.json,
   if one exists

nodeModuleCache.stop()
===

stops the module

```
nodeModuleCache.stop();
```

nodeModuleCache.saveCache()
===

saves the cache file

```
nodeModuleCache.saveCache();
```

nodeModuleCache.loadCache()
===

loads the cache file

```
nodeModuleCache.loadCache();
```