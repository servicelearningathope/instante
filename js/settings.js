function Settings(lastLanguage, updateURL, lastUpdate)
{
   /*
   setting options:
      updateURL
      lastUpdate
      lastLanguage
   */
   var _db = window.localStorage;
   var _tableName = 'settings';
   if(_db.getItem(_tableName) == null) {
      this.lastLanguage = "en";
      this.lastUpdate = Date();
      this.updateURL = "http://hcc-offm.org";
      _db.setItem(_tableName, JSON.stringify(this));  
   }

   if(lastUpdate != '') {this.lastUpdate = lastUpdate;}
   if(updateURL != '') {this.updateURL = updateURL;}
   if(lastLanguage != '') {this.lastLanguage = lastLanguage;}

   this.save = function()
   {
      this.lastUpdate = Date();
      _db.setItem(_tableName, JSON.stringify(this));
   }

   this.load = function()
   {
      values = JSON.parse(_db.getItem(_tableName));
      this.updateURL = values["updateURL"];
      this.lastUpdate = values["lastUpdate"];
      this.lastLanguage = values["lastLanguage"];
      return this;
   }
   this.to_json = function() {
      return JSON.parse(_db.getItem(_tableName));
   }
}

Settings.saveSetting = function (key, value) {
   var settings = new Settings().load();
   switch(key) {
      case 'updateURL': settings.updateURL = value;
      case 'lastLanguage': settings.lastLanguage = value;
   }
   settings.save();
}

Settings.getSettings = function()
{
   var settings = new Settings().to_json();
   return (settings === null) ?
      {} :
      new Settings(
         settings.lastLanguage,
         settings.updateURL,
         settings.lastUpdate
      );
}