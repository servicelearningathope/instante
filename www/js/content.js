function Content(contentId, langEN, langES)
{
   var _db = window.localStorage;
   var _tableName = 'contents';

   this.contentId = contentId;
   this.langEN = langEN;
   this.langES = langES;

   this.save = function()
   {
      var ContentIndex = Content.getIndex(this.contentId);
      var Contents = Content.getContents();

      if (ContentIndex === false)
         Contents.push(this);
      else
         Contents[ContentIndex] = this;

      _db.setItem(_tableName, JSON.stringify(Contents));
   }

   this.load = function()
   {
      return JSON.parse(_db.getItem(_tableName));
   }
}

Content.prototype.compareTo = function(other)
{
   return Content.compare(this, other);
}

Content.compare = function(Content, other)
{
   if (other == null)
      return 1;
   else if (Content == null)
      return -1;

   return Content.contentId.localeCompare(other.contentId);
}

Content.getContents = function()
{
   var Contents = new Content().load();
   return (Contents === null) ? [] : Contents;
}

Content.getContent = function(contentId)
{
   var index = Content.getIndex(contentId);
   return (index === false) ? null : Content.getContents()[index];
}

Content.getIndex = function(contentId)
{
   var Contents = Content.getContents();
   for(var i = 0; i < Contents.length; i++)
   {
      if (Contents[i].contentId.toUpperCase() === contentId.toUpperCase())
         return i;
   }

   return false;
}

Content.getEN = function(contentId)
{
   var Content = Content.getContent(contentId);
   return (Content === null) ? "" : Content.langEN;
}
Content.getES = function(contentId)
{
   var Content = Content.getContent(contentId);
   return (Content === null) ? "" : Content.langES;
}