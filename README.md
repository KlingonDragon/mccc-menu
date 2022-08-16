# MC Command Center Online Settings Menu

https://mccc-menu.online/

## mccc-menu Repository
This Repository contains the source code for the online MCCC Settings

#### Test Offline
Simple method:
```
python3 -m http.server
```
PHP code will not run using this method, this only affects version numbers and search.

### Directory Structure
- /img
  > image folder
  - /icons
    > icons used in menu
- /menu_data
  > contains json files with menu page configurations 
- /strings
  > string files for each supported language in own folder
  - /cs
  - /da
  - /de
  - /en
  - /es
  - /fr
  - /it
  - /ja
  - /ko
  - /nl
  - /pl
  - /pt
  - /ru
  - /se
  - /zh-CN
  - /zh-TW

- app.webmanifest
  > json file with PWA details
- index.html
  > Homepage 
- script.js
  > main js code that makes the menu work
- search.php
  > **!Broken!** php to be run by server to search for settings
- style.css
  > main css styling information
- version.php
  > php to be run by server to access version info by ftp

### /img/icons
png files extracted from the game and mod files
> *file name hexadecimal in upper case* 

### /strings/__/
text files (no extension) conatining strings extracted from mod stbl files. Extra strings provided by translators
> *file name hexadecimal in upper case*