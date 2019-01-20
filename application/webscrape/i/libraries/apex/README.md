
## ![Oracle Logo](styles/images/oracle_logo_sm.png "Oracle Logo")<br> Oracle Application Express JavaScript API Reference

This section describes the JavaScript APIs available to Oracle Application Express applications.
You can use these functions to provide client-side functionality, such as showing and hiding page elements,
or making Ajax (Asynchronous JavaScript and XML) requests.

Most of the Application Express JavaScript APIs are organized into namespaces. A namespace is simply a global singleton
object that contains a number of functions. There is one top level Application Express namespace called {@link apex}.
This has a number of sub namespaces such as {@link apex.server} and {@link apex.util}. Namespaces help to organize code
and reduce the chance of name conflicts with other JavaScript libraries.

There are some older global functions that are not in a namespace. Most of these start with a $ character. These are
known as {@link global|Non-namespace APIs}. Global symbols that start with <code class="prettyprint">apex</code>
or <code class="prettyprint">$</code> are reserved by APEX.

Some functions return an interface, which is an object that contains functions known as methods and
variables known as properties, that allows access to a specific instance of a page component or other entity.

Application Express also includes a number of UI widgets based on the jQuery UI widget factory. Widgets are high level
user interface components such as menus, trees, or grids. Application Express makes it easy to declaratively add
components such as items and regions to a page. Internally some components are implemented using these widgets. Default
component behavior does not require any JavaScript programming. To implement advanced use cases you can leverage the
documented widget methods, options and events.

### Adding JavaScript to an Application Express application

Oracle APEX handles the details of rendering a page so compared to authoring your own HTML file it may not be initially
clear where you should add your JavaScript code. APEX provides a number of specific places for you to add JavaScript code.
You should avoid entering your own <code class="prettyprint">&lt;script></code> tags in places where markup is allowed.
Also avoid entering JavaScript code using the <code class="prettyprint">javascript:</code> pseudo-protocol in places
where URLs are allowed.

Various components may have specific attributes for JavaScript code snippets. For example some regions and items have
an Advanced: JavaScript Initialization Code attribute that is used for advanced configuration of the region or item.
This code is applied in a specific context for a specific purpose. See the associated attribute help in Page Designer
for details.

Dynamic Actions provide a way to respond to events. There are a number of declarative actions that can be run in
response to an event. In addition you can use the Execute JavaScript Code action to execute your own JavaScript.
This code is added to the page and run when the specified event occurs. Dynamic Actions added to the Global Page
can apply to all pages subject to any Server-Side Condition.

Each page can have its own specific JavaScript code added to it using the following page attributes in the JavaScript
section:

* File URLs - Specify one JavaScript file URL per line. These files could be third party libraries or your own
JavaScript code.
* Function and Global Variable Declaration - This code runs after the core APEX libraries and above File URLs
have been loaded and before the document is ready (DOMContentLoaded event or jQuery ready).
* Execute when Page Loads - This code runs after the document is ready and after all APEX generated
JavaScript code.

See the Page Designer help for details on each of the above attributes.

It is a best practice to put the bulk of your code into one or more files. These files can be served by a web server
that you have access to or served by APEX by adding the file to Shared Components: Static Application Files or,
to share the file among multiple apps, Static Workspace Files.

Using third party tools you can minify your JavaScript files to make them smaller, which makes them load faster. The
minified files should be put in a sub folder named <code class="prettyprint">minified/</code> relative to the original
source file or the file name should include <code class="prettyprint">.min</code>. This allows using substitution
token #MIN# to include <code class="prettyprint">.min</code> or #MIN_DIRECTORY# to include
<code class="prettyprint">minified/</code> as part of the File URL. You can use #MIN# or #MIN_DIRECTORY# or both.
This allows the minified file to be loaded normally but in debug mode the non-minified (original source) file will
be used for easier debugging.

For example if you have a file called <code class="prettyprint">appUtils.js</code> added to Static Application Files
you can create a minified version of that file called <code class="prettyprint">appUtils.min.js</code> that is also
added to Static Application Files. You would then reference the file as:

<pre class="prettyprint"><code>#APP_IMAGES#appUtils#MIN#.js</code></pre>

If you have a file that you want loaded on all pages you can enter that file in one place rather than on
each page. Shared Components > User Interface Attributes > User Interface Details has an attribute where you can
enter any number of JavaScript File URLs (one per line).

It is recommended to use Universal Theme. However if you do create your own theme (very few people do this)
there is an attribute to specify the JavaScript File URLs that are needed by your theme.

The Universal Theme provides all the templates you need for a wide range of user interface layouts and functionality.
In special cases you may create your own templates. Most template types such as region and list templates allow
entering JavaScript File URLs and JavaScript code that apply to the template. On any page where those templates are
used the corresponding JavaScript is added. Page templates have template attributes for JavaScript corresponding to
the page attributes listed above.

Page templates also define the order in which JavaScript is loaded on the page. (The order in which the code actually
runs is controlled by other factors such as events including the document ready event.) The order is given by
the following template substitution tokens which should be at the end of the document body.

* #APEX_JAVASCRIPT#
* #THEME_JAVASCRIPT#
* #TEMPLATE_JAVASCRIPT#
* #APPLICATION_JAVASCRIPT#
* #PAGE_JAVASCRIPT#
* #GENERATED_JAVASCRIPT#

If you define your own page template it is highly recommended not to change the order. When in doubt about where
your code is loaded view the page source. Set breakpoints or use <code class="prettyprint">console.log</code> or
{@link apex.debug} functions to determine when your code executes.

The best way to modularize and reuse your code is to create APEX plug-ins. Region, Item, and Dynamic Action plug-ins
let you control what the server renders for the corresponding component. This includes JavaScript code and
JavaScript files. JavaScript files can be uploaded as part of the plug-in. See the APEX PL/SQL APIs in the
<code class="prettyprint">APEX_JAVASCRIPT</code> package including <code class="prettyprint">ADD_3RD_PARTY_LIBRARY_FILE</code>
and <code class="prettyprint">ADD_ONLOAD_CODE</code>.

All the APEX APIs described here are in files located relative to <code class="prettyprint">#IMAGE_PREFIX#libraries/apex/</code>.
APEX adds the necessary JavaScript files based on the contents of the page. For example if the page
has an Interactive Grid region the <code class="prettyprint">model.js</code>, and
<code class="prettyprint">widget.interactiveGrid.js</code> files as well as others will automatically be included
on the page. The only reason you would need to manually include an APEX JavaScript file is if you are using an API or widget
without including the corresponding component on the page - this is very unusual.
Unless the page is in debug mode a minified JavaScript file will be loaded and in many cases multiple minified files are
concatenated into a single file. The JavaScript files used most frequently by APEX are concatenated into
<code class="prettyprint">desktop.min.js</code> (<code class="prettyprint">desktop_all.min.js</code>
includes jQuery as well) which is included on all pages. This is for informational purposes.
The set of files and how they are concatenated is subject to change in each release. You can define your own concatenated
files using Shared Components > User Interface Attributes > User Interface Details: Create Concatenated File.

### Legacy JavaScript APIs
JavaScript functions that are deprecated and desupported have been moved to legacy JavaScript files,
which can be found in <code class="prettyprint">/i/libraries/apex/legacy*.js</code>.
Deprecation and desupport notices are given in the release notes.
Oracle recommends that you rewrite or replace any code that uses these legacy functions.

To give the developer time to migrate their code away from deprecated and desupported functions APEX has the option to
include the legacy JavaScript files. This is achieved by using the Include Deprecated or Desupported Javascript Functions
checkboxes on the Shared Components > User Interface Attributes > User Interface Details page.

When developing new applications, no legacy files are included by default.

Existing applications are migrated with the latest legacy file option checked, for backward compatibility.
To not include this legacy file, you need to go through the functions listed in the legacy file, and search your
application and associated JavaScript files for any references to those files.
Once you are happy that there are no references to these functions, you can switch off
including the legacy file(s) and benefit from loading fewer files.
