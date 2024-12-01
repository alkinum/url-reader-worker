export const READABILITY_JS = JSON.parse(
  '"function Readability(e,t){if(t&&t.documentElement)e=t,t=arguments[2];else if(!e||!e.documentElement)throw new Error(\\"First argument to Readability constructor should be a document object.\\");if(t=t||{},this._doc=e,this._docJSDOMParser=this._doc.firstChild.__JSDOMParser__,this._articleTitle=null,this._articleByline=null,this._articleDir=null,this._articleSiteName=null,this._attempts=[],this._debug=!!t.debug,this._maxElemsToParse=t.maxElemsToParse||this.DEFAULT_MAX_ELEMS_TO_PARSE,this._nbTopCandidates=t.nbTopCandidates||this.DEFAULT_N_TOP_CANDIDATES,this._charThreshold=t.charThreshold||this.DEFAULT_CHAR_THRESHOLD,this._classesToPreserve=this.CLASSES_TO_PRESERVE.concat(t.classesToPreserve||[]),this._keepClasses=!!t.keepClasses,this._serializer=t.serializer||function(e){return e.innerHTML},this._disableJSONLD=!!t.disableJSONLD,this._allowedVideoRegex=t.allowedVideoRegex||this.REGEXPS.videos,this._flags=this.FLAG_STRIP_UNLIKELYS|this.FLAG_WEIGHT_CLASSES|this.FLAG_CLEAN_CONDITIONALLY,this._debug){let t=function(e){if(e.nodeType==e.TEXT_NODE)return`${e.nodeName} (\\"${e.textContent}\\")`;var t=Array.from(e.attributes||[],function(e){return`${e.name}=\\"${e.value}\\"`}).join(\\" \\");return`<${e.localName} ${t}>`};this.log=function(){if(\\"undefined\\"!=typeof console){let e=Array.from(arguments,e=>e&&e.nodeType==this.ELEMENT_NODE?t(e):e);e.unshift(\\"Reader: (Readability)\\"),console.log.apply(console,e)}else{var e;\\"undefined\\"!=typeof dump&&(e=Array.prototype.map.call(arguments,function(e){return e&&e.nodeName?t(e):e}).join(\\" \\"),dump(\\"Reader: (Readability) \\"+e+\\"\\\\n\\"))}}}else this.log=function(){}}Readability.prototype={FLAG_STRIP_UNLIKELYS:1,FLAG_WEIGHT_CLASSES:2,FLAG_CLEAN_CONDITIONALLY:4,ELEMENT_NODE:1,TEXT_NODE:3,DEFAULT_MAX_ELEMS_TO_PARSE:0,DEFAULT_N_TOP_CANDIDATES:5,DEFAULT_TAGS_TO_SCORE:\\"section,h2,h3,h4,h5,h6,p,td,pre\\".toUpperCase().split(\\",\\"),DEFAULT_CHAR_THRESHOLD:500,REGEXPS:{unlikelyCandidates:/-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,okMaybeItsACandidate:/and|article|body|column|content|main|shadow/i,positive:/article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,negative:/-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|foot|footer|footnote|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,extraneous:/print|archive|comment|discuss|e[\\\\-]?mail|share|reply|all|login|sign|single|utility/i,byline:/byline|author|dateline|writtenby|p-author/i,replaceFonts:/<(\\\\/?)font[^>]*>/gi,normalize:/\\\\s{2,}/g,videos:/\\\\/\\\\/(www\\\\.)?((dailymotion|youtube|youtube-nocookie|player\\\\.vimeo|v\\\\.qq)\\\\.com|(archive|upload\\\\.wikimedia)\\\\.org|player\\\\.twitch\\\\.tv)/i,shareElements:/(\\\\b|_)(share|sharedaddy)(\\\\b|_)/i,nextLink:/(next|weiter|continue|>([^\\\\|]|$)|»([^\\\\|]|$))/i,prevLink:/(prev|earl|old|new|<|«)/i,tokenize:/\\\\W+/g,whitespace:/^\\\\s*$/,hasContent:/\\\\S$/,hashUrl:/^#.+/,srcsetUrl:/(\\\\S+)(\\\\s+[\\\\d.]+[xw])?(\\\\s*(?:,|$))/g,b64DataUrl:/^data:\\\\s*([^\\\\s;,]+)\\\\s*;\\\\s*base64\\\\s*,/i,commas:/\\\\u002C|\\\\u060C|\\\\uFE50|\\\\uFE10|\\\\uFE11|\\\\u2E41|\\\\u2E34|\\\\u2E32|\\\\uFF0C/g,jsonLdArticleTypes:/^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/},UNLIKELY_ROLES:[\\"menu\\",\\"menubar\\",\\"complementary\\",\\"navigation\\",\\"alert\\",\\"alertdialog\\",\\"dialog\\"],DIV_TO_P_ELEMS:new Set([\\"BLOCKQUOTE\\",\\"DL\\",\\"DIV\\",\\"IMG\\",\\"OL\\",\\"P\\",\\"PRE\\",\\"TABLE\\",\\"UL\\"]),ALTER_TO_DIV_EXCEPTIONS:[\\"DIV\\",\\"ARTICLE\\",\\"SECTION\\",\\"P\\"],PRESENTATIONAL_ATTRIBUTES:[\\"align\\",\\"background\\",\\"bgcolor\\",\\"border\\",\\"cellpadding\\",\\"cellspacing\\",\\"frame\\",\\"hspace\\",\\"rules\\",\\"style\\",\\"valign\\",\\"vspace\\"],DEPRECATED_SIZE_ATTRIBUTE_ELEMS:[\\"TABLE\\",\\"TH\\",\\"TD\\",\\"HR\\",\\"PRE\\"],PHRASING_ELEMS:[\\"ABBR\\",\\"AUDIO\\",\\"B\\",\\"BDO\\",\\"BR\\",\\"BUTTON\\",\\"CITE\\",\\"CODE\\",\\"DATA\\",\\"DATALIST\\",\\"DFN\\",\\"EM\\",\\"EMBED\\",\\"I\\",\\"IMG\\",\\"INPUT\\",\\"KBD\\",\\"LABEL\\",\\"MARK\\",\\"MATH\\",\\"METER\\",\\"NOSCRIPT\\",\\"OBJECT\\",\\"OUTPUT\\",\\"PROGRESS\\",\\"Q\\",\\"RUBY\\",\\"SAMP\\",\\"SCRIPT\\",\\"SELECT\\",\\"SMALL\\",\\"SPAN\\",\\"STRONG\\",\\"SUB\\",\\"SUP\\",\\"TEXTAREA\\",\\"TIME\\",\\"VAR\\",\\"WBR\\"],CLASSES_TO_PRESERVE:[\\"page\\"],HTML_ESCAPE_MAP:{lt:\\"<\\",gt:\\">\\",amp:\\"&\\",quot:\'\\"\',apos:\\"\'\\"},_postProcessContent:function(e){this._fixRelativeUris(e),this._simplifyNestedElements(e),this._keepClasses||this._cleanClasses(e)},_removeNodes:function(e,t){if(this._docJSDOMParser&&e._isLiveNodeList)throw new Error(\\"Do not pass live node lists to _removeNodes\\");for(var i=e.length-1;0<=i;i--){var a=e[i],n=a.parentNode;!n||t&&!t.call(this,a,i,e)||n.removeChild(a)}},_replaceNodeTags:function(e,t){if(this._docJSDOMParser&&e._isLiveNodeList)throw new Error(\\"Do not pass live node lists to _replaceNodeTags\\");for(const i of e)this._setNodeTag(i,t)},_forEachNode:function(e,t){Array.prototype.forEach.call(e,t,this)},_findNode:function(e,t){return Array.prototype.find.call(e,t,this)},_someNode:function(e,t){return Array.prototype.some.call(e,t,this)},_everyNode:function(e,t){return Array.prototype.every.call(e,t,this)},_concatNodeLists:function(){var t=Array.prototype.slice,e=t.call(arguments).map(function(e){return t.call(e)});return Array.prototype.concat.apply([],e)},_getAllNodesWithTag:function(t,e){return t.querySelectorAll?t.querySelectorAll(e.join(\\",\\")):[].concat.apply([],e.map(function(e){e=t.getElementsByTagName(e);return Array.isArray(e)?e:Array.from(e)}))},_cleanClasses:function(e){var t=this._classesToPreserve,i=(e.getAttribute(\\"class\\")||\\"\\").split(/\\\\s+/).filter(function(e){return-1!=t.indexOf(e)}).join(\\" \\");for(i?e.setAttribute(\\"class\\",i):e.removeAttribute(\\"class\\"),e=e.firstElementChild;e;e=e.nextElementSibling)this._cleanClasses(e)},_fixRelativeUris:function(e){var t=this._doc.baseURI,i=this._doc.documentURI;function n(e){if(t==i&&\\"#\\"==e.charAt(0))return e;try{return new URL(e,t).href}catch(e){}return e}var a=this._getAllNodesWithTag(e,[\\"a\\"]),a=(this._forEachNode(a,function(e){var t=e.getAttribute(\\"href\\");if(t)if(0===t.indexOf(\\"javascript:\\"))if(1===e.childNodes.length&&e.childNodes[0].nodeType===this.TEXT_NODE){var i=this._doc.createTextNode(e.textContent);e.parentNode.replaceChild(i,e)}else{for(var a=this._doc.createElement(\\"span\\");e.firstChild;)a.appendChild(e.firstChild);e.parentNode.replaceChild(a,e)}else e.setAttribute(\\"href\\",n(t))}),this._getAllNodesWithTag(e,[\\"img\\",\\"picture\\",\\"figure\\",\\"video\\",\\"audio\\",\\"source\\"]));this._forEachNode(a,function(e){var t=e.getAttribute(\\"src\\"),i=e.getAttribute(\\"poster\\"),a=e.getAttribute(\\"srcset\\");t&&e.setAttribute(\\"src\\",n(t)),i&&e.setAttribute(\\"poster\\",n(i)),a&&(t=a.replace(this.REGEXPS.srcsetUrl,function(e,t,i,a){return n(t)+(i||\\"\\")+a}),e.setAttribute(\\"srcset\\",t))})},_simplifyNestedElements:function(e){for(var t=e;t;){if(t.parentNode&&[\\"DIV\\",\\"SECTION\\"].includes(t.tagName)&&(!t.id||!t.id.startsWith(\\"readability\\"))){if(this._isElementWithoutContent(t)){t=this._removeAndGetNext(t);continue}if(this._hasSingleTagInsideElement(t,\\"DIV\\")||this._hasSingleTagInsideElement(t,\\"SECTION\\")){for(var i=t.children[0],a=0;a<t.attributes.length;a++)i.setAttribute(t.attributes[a].name,t.attributes[a].value);t.parentNode.replaceChild(i,t),t=i;continue}}t=this._getNextNode(t)}},_getArticleTitle:function(){var e=this._doc,t=\\"\\",i=\\"\\";try{\\"string\\"!=typeof(t=i=e.title.trim())&&(t=i=this._getInnerText(e.getElementsByTagName(\\"title\\")[0]))}catch(e){}var a,n,r=!1;function s(e){return e.split(/\\\\s+/).length}/ [\\\\|\\\\-\\\\\\\\\\\\/>»] /.test(t)?(r=/ [\\\\\\\\\\\\/>»] /.test(t),s(t=i.replace(/(.*)[\\\\|\\\\-\\\\\\\\\\\\/>»] .*/gi,\\"$1\\"))<3&&(t=i.replace(/[^\\\\|\\\\-\\\\\\\\\\\\/>»]*[\\\\|\\\\-\\\\\\\\\\\\/>»](.*)/gi,\\"$1\\"))):-1!==t.indexOf(\\": \\")?(n=this._concatNodeLists(e.getElementsByTagName(\\"h1\\"),e.getElementsByTagName(\\"h2\\")),a=t.trim(),this._someNode(n,function(e){return e.textContent.trim()===a})||(s(t=i.substring(i.lastIndexOf(\\":\\")+1))<3?t=i.substring(i.indexOf(\\":\\")+1):5<s(i.substr(0,i.indexOf(\\":\\")))&&(t=i))):(150<t.length||t.length<15)&&1===(n=e.getElementsByTagName(\\"h1\\")).length&&(t=this._getInnerText(n[0]));e=s(t=t.trim().replace(this.REGEXPS.normalize,\\" \\"));return t=e<=4&&(!r||e!=s(i.replace(/[\\\\|\\\\-\\\\\\\\\\\\/>»]+/g,\\"\\"))-1)?i:t},_prepDocument:function(){var e=this._doc;this._removeNodes(this._getAllNodesWithTag(e,[\\"style\\"])),e.body&&this._replaceBrs(e.body),this._replaceNodeTags(this._getAllNodesWithTag(e,[\\"font\\"]),\\"SPAN\\")},_nextNode:function(e){for(var t=e;t&&t.nodeType!=this.ELEMENT_NODE&&this.REGEXPS.whitespace.test(t.textContent);)t=t.nextSibling;return t},_replaceBrs:function(e){this._forEachNode(this._getAllNodesWithTag(e,[\\"br\\"]),function(e){for(var t=e.nextSibling,i=!1;(t=this._nextNode(t))&&\\"BR\\"==t.tagName;){var i=!0,a=t.nextSibling;t.parentNode.removeChild(t),t=a}if(i){var n=this._doc.createElement(\\"p\\");for(e.parentNode.replaceChild(n,e),t=n.nextSibling;t;){if(\\"BR\\"==t.tagName){var r=this._nextNode(t.nextSibling);if(r&&\\"BR\\"==r.tagName)break}if(!this._isPhrasingContent(t))break;r=t.nextSibling;n.appendChild(t),t=r}for(;n.lastChild&&this._isWhitespace(n.lastChild);)n.removeChild(n.lastChild);\\"P\\"===n.parentNode.tagName&&this._setNodeTag(n.parentNode,\\"DIV\\")}})},_setNodeTag:function(e,t){if(this.log(\\"_setNodeTag\\",e,t),this._docJSDOMParser)return e.localName=t.toLowerCase(),e.tagName=t.toUpperCase(),e;for(var i=e.ownerDocument.createElement(t);e.firstChild;)i.appendChild(e.firstChild);e.parentNode.replaceChild(i,e),e.readability&&(i.readability=e.readability);for(var a=0;a<e.attributes.length;a++)try{i.setAttribute(e.attributes[a].name,e.attributes[a].value)}catch(e){}return i},_prepArticle:function(e){this._cleanStyles(e),this._markDataTables(e),this._fixLazyImages(e),this._cleanConditionally(e,\\"form\\"),this._cleanConditionally(e,\\"fieldset\\"),this._clean(e,\\"object\\"),this._clean(e,\\"embed\\"),this._clean(e,\\"footer\\"),this._clean(e,\\"link\\"),this._clean(e,\\"aside\\");var i=this.DEFAULT_CHAR_THRESHOLD;this._forEachNode(e.children,function(e){this._cleanMatchedNodes(e,function(e,t){return this.REGEXPS.shareElements.test(t)&&e.textContent.length<i})}),this._clean(e,\\"iframe\\"),this._clean(e,\\"input\\"),this._clean(e,\\"textarea\\"),this._clean(e,\\"select\\"),this._clean(e,\\"button\\"),this._cleanHeaders(e),this._cleanConditionally(e,\\"table\\"),this._cleanConditionally(e,\\"ul\\"),this._cleanConditionally(e,\\"div\\"),this._replaceNodeTags(this._getAllNodesWithTag(e,[\\"h1\\"]),\\"h2\\"),this._removeNodes(this._getAllNodesWithTag(e,[\\"p\\"]),function(e){return 0===e.getElementsByTagName(\\"img\\").length+e.getElementsByTagName(\\"embed\\").length+e.getElementsByTagName(\\"object\\").length+e.getElementsByTagName(\\"iframe\\").length&&!this._getInnerText(e,!1)}),this._forEachNode(this._getAllNodesWithTag(e,[\\"br\\"]),function(e){var t=this._nextNode(e.nextSibling);t&&\\"P\\"==t.tagName&&e.parentNode.removeChild(e)}),this._forEachNode(this._getAllNodesWithTag(e,[\\"table\\"]),function(e){var t=this._hasSingleTagInsideElement(e,\\"TBODY\\")?e.firstElementChild:e;this._hasSingleTagInsideElement(t,\\"TR\\")&&(t=t.firstElementChild,this._hasSingleTagInsideElement(t,\\"TD\\")&&(t=t.firstElementChild,t=this._setNodeTag(t,this._everyNode(t.childNodes,this._isPhrasingContent)?\\"P\\":\\"DIV\\"),e.parentNode.replaceChild(t,e)))})},_initializeNode:function(e){switch(e.readability={contentScore:0},e.tagName){case\\"DIV\\":e.readability.contentScore+=5;break;case\\"PRE\\":case\\"TD\\":case\\"BLOCKQUOTE\\":e.readability.contentScore+=3;break;case\\"ADDRESS\\":case\\"OL\\":case\\"UL\\":case\\"DL\\":case\\"DD\\":case\\"DT\\":case\\"LI\\":case\\"FORM\\":e.readability.contentScore-=3;break;case\\"H1\\":case\\"H2\\":case\\"H3\\":case\\"H4\\":case\\"H5\\":case\\"H6\\":case\\"TH\\":e.readability.contentScore-=5}e.readability.contentScore+=this._getClassWeight(e)},_removeAndGetNext:function(e){var t=this._getNextNode(e,!0);return e.parentNode.removeChild(e),t},_getNextNode:function(e,t){if(!t&&e.firstElementChild)return e.firstElementChild;if(e.nextElementSibling)return e.nextElementSibling;for(;(e=e.parentNode)&&!e.nextElementSibling;);return e&&e.nextElementSibling},_textSimilarity:function(e,t){var i=e.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean),e=t.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);return i.length&&e.length?1-e.filter(e=>!i.includes(e)).join(\\" \\").length/e.join(\\" \\").length:0},_checkByline:function(e,t){return!this._articleByline&&(void 0!==e.getAttribute&&(i=e.getAttribute(\\"rel\\"),a=e.getAttribute(\\"itemprop\\")),!(!(\\"author\\"===i||a&&-1!==a.indexOf(\\"author\\")||this.REGEXPS.byline.test(t))||!this._isValidByline(e.textContent))&&(this._articleByline=e.textContent.trim(),!0));var i,a},_getNodeAncestors:function(e,t){t=t||0;for(var i=0,a=[];e.parentNode&&(a.push(e.parentNode),!t||++i!==t);)e=e.parentNode;return a},_grabArticle:function(t){this.log(\\"**** grabArticle ****\\");var i=this._doc,a=null!==t;if(!(t=t||this._doc.body))return this.log(\\"No body found in document. Abort.\\"),null;for(var M=t.innerHTML;;){this.log(\\"Starting grabArticle loop\\");var H=this._flagIsActive(this.FLAG_STRIP_UNLIKELYS),n=[],r=this._doc.documentElement;let e=!0;for(;r;){\\"HTML\\"===r.tagName&&(this._articleLang=r.getAttribute(\\"lang\\"));var s=r.className+\\" \\"+r.id;if(this._isProbablyVisible(r))if(\\"true\\"==r.getAttribute(\\"aria-modal\\")&&\\"dialog\\"==r.getAttribute(\\"role\\"))r=this._removeAndGetNext(r);else if(this._checkByline(r,s))r=this._removeAndGetNext(r);else if(e&&this._headerDuplicatesTitle(r))this.log(\\"Removing header: \\",r.textContent.trim(),this._articleTitle.trim()),e=!1,r=this._removeAndGetNext(r);else{if(H){if(this.REGEXPS.unlikelyCandidates.test(s)&&!this.REGEXPS.okMaybeItsACandidate.test(s)&&!this._hasAncestorTag(r,\\"table\\")&&!this._hasAncestorTag(r,\\"code\\")&&\\"BODY\\"!==r.tagName&&\\"A\\"!==r.tagName){this.log(\\"Removing unlikely candidate - \\"+s),r=this._removeAndGetNext(r);continue}if(this.UNLIKELY_ROLES.includes(r.getAttribute(\\"role\\"))){this.log(\\"Removing content with role \\"+r.getAttribute(\\"role\\")+\\" - \\"+s),r=this._removeAndGetNext(r);continue}}if(\\"DIV\\"!==r.tagName&&\\"SECTION\\"!==r.tagName&&\\"HEADER\\"!==r.tagName&&\\"H1\\"!==r.tagName&&\\"H2\\"!==r.tagName&&\\"H3\\"!==r.tagName&&\\"H4\\"!==r.tagName&&\\"H5\\"!==r.tagName&&\\"H6\\"!==r.tagName||!this._isElementWithoutContent(r)){if(-1!==this.DEFAULT_TAGS_TO_SCORE.indexOf(r.tagName)&&n.push(r),\\"DIV\\"===r.tagName){for(var l,o=null,h=r.firstChild;h;){var U=h.nextSibling;if(this._isPhrasingContent(h))null!==o?o.appendChild(h):this._isWhitespace(h)||(o=i.createElement(\\"p\\"),r.replaceChild(o,h),o.appendChild(h));else if(null!==o){for(;o.lastChild&&this._isWhitespace(o.lastChild);)o.removeChild(o.lastChild);o=null}h=U}this._hasSingleTagInsideElement(r,\\"P\\")&&this._getLinkDensity(r)<.25?(l=r.children[0],r.parentNode.replaceChild(l,r),n.push(r=l)):this._hasChildBlockElement(r)||(r=this._setNodeTag(r,\\"P\\"),n.push(r))}r=this._getNextNode(r)}else r=this._removeAndGetNext(r)}else this.log(\\"Removing hidden node - \\"+s),r=this._removeAndGetNext(r)}for(var c=[],d=(this._forEachNode(n,function(e){var t,i;!e.parentNode||void 0===e.parentNode.tagName||(t=this._getInnerText(e)).length<25||0!==(e=this._getNodeAncestors(e,5)).length&&(i=0,++i,i=(i+=t.split(this.REGEXPS.commas).length)+Math.min(Math.floor(t.length/100),3),this._forEachNode(e,function(e,t){e.tagName&&e.parentNode&&void 0!==e.parentNode.tagName&&(void 0===e.readability&&(this._initializeNode(e),c.push(e)),e.readability.contentScore+=i/(0===t?1:1===t?2:3*t))}))}),[]),g=0,k=c.length;g<k;g+=1){var u=c[g],m=u.readability.contentScore*(1-this._getLinkDensity(u));u.readability.contentScore=m,this.log(\\"Candidate:\\",u,\\"with score \\"+m);for(var _=0;_<this._nbTopCandidates;_++){var p=d[_];if(!p||m>p.readability.contentScore){d.splice(_,0,u),d.length>this._nbTopCandidates&&d.pop();break}}}var f=d[0]||null,N=!1;if(null===f||\\"BODY\\"===f.tagName){for(f=i.createElement(\\"DIV\\"),N=!0;t.firstChild;)this.log(\\"Moving child out:\\",t.firstChild),f.appendChild(t.firstChild);t.appendChild(f),this._initializeNode(f)}else if(f){for(var E=[],T=1;T<d.length;T++).75<=d[T].readability.contentScore/f.readability.contentScore&&E.push(this._getNodeAncestors(d[T]));if(3<=E.length)for(y=f.parentNode;\\"BODY\\"!==y.tagName;){for(var b=0,A=0;A<E.length&&b<3;A++)b+=Number(E[A].includes(y));if(3<=b){f=y;break}y=y.parentNode}f.readability||this._initializeNode(f);for(var y=f.parentNode,v=f.readability.contentScore,F=v/3;\\"BODY\\"!==y.tagName;)if(y.readability){var S=y.readability.contentScore;if(S<F)break;if(v<S){f=y;break}v=y.readability.contentScore,y=y.parentNode}else y=y.parentNode;for(y=f.parentNode;\\"BODY\\"!=y.tagName&&1==y.children.length;)y=(f=y).parentNode;f.readability||this._initializeNode(f)}for(var C=i.createElement(\\"DIV\\"),W=(a&&(C.id=\\"readability-content\\"),Math.max(10,.2*f.readability.contentScore)),L=(y=f.parentNode).children,x=0,I=L.length;x<I;x++){var D,R,P,O=L[x],w=!1;this.log(\\"Looking at sibling node:\\",O,O.readability?\\"with score \\"+O.readability.contentScore:\\"\\"),this.log(\\"Sibling has score\\",O.readability?O.readability.contentScore:\\"Unknown\\"),O===f?w=!0:(D=0,O.className===f.className&&\\"\\"!==f.className&&(D+=.2*f.readability.contentScore),O.readability&&O.readability.contentScore+D>=W?w=!0:\\"P\\"===O.nodeName&&(D=this._getLinkDensity(O),(80<(P=(R=this._getInnerText(O)).length)&&D<.25||P<80&&0<P&&0===D&&-1!==R.search(/\\\\.( |$)/))&&(w=!0))),w&&(this.log(\\"Appending node:\\",O),-1===this.ALTER_TO_DIV_EXCEPTIONS.indexOf(O.nodeName)&&(this.log(\\"Altering sibling:\\",O,\\"to div.\\"),O=this._setNodeTag(O,\\"DIV\\")),C.appendChild(O),L=y.children,--x,--I)}if(this._debug&&this.log(\\"Article content pre-prep: \\"+C.innerHTML),this._prepArticle(C),this._debug&&this.log(\\"Article content post-prep: \\"+C.innerHTML),N)f.id=\\"readability-page-1\\",f.className=\\"page\\";else{var B=i.createElement(\\"DIV\\");for(B.id=\\"readability-page-1\\",B.className=\\"page\\";C.firstChild;)B.appendChild(C.firstChild);C.appendChild(B)}this._debug&&this.log(\\"Article content after paging: \\"+C.innerHTML);var N=!0,G=this._getInnerText(C,!0).length;if(G<this._charThreshold)if(N=!1,t.innerHTML=M,this._flagIsActive(this.FLAG_STRIP_UNLIKELYS))this._removeFlag(this.FLAG_STRIP_UNLIKELYS),this._attempts.push({articleContent:C,textLength:G});else if(this._flagIsActive(this.FLAG_WEIGHT_CLASSES))this._removeFlag(this.FLAG_WEIGHT_CLASSES),this._attempts.push({articleContent:C,textLength:G});else if(this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY))this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY),this._attempts.push({articleContent:C,textLength:G});else{if(this._attempts.push({articleContent:C,textLength:G}),this._attempts.sort(function(e,t){return t.textLength-e.textLength}),!this._attempts[0].textLength)return null;C=this._attempts[0].articleContent,N=!0}if(N)return G=[y,f].concat(this._getNodeAncestors(y)),this._someNode(G,function(e){if(!e.tagName)return!1;e=e.getAttribute(\\"dir\\");return!!e&&(this._articleDir=e,!0)}),C}},_isValidByline:function(e){return(\\"string\\"==typeof e||e instanceof String)&&(0<(e=e.trim()).length&&e.length<100)},_unescapeHtmlEntities:function(e){if(!e)return e;var i=this.HTML_ESCAPE_MAP;return e.replace(/&(quot|amp|apos|lt|gt);/g,function(e,t){return i[t]}).replace(/&#(?:x([0-9a-z]{1,4})|([0-9]{1,4}));/gi,function(e,t,i){i=parseInt(t||i,t?16:10);return String.fromCharCode(i)})},_getJSONLD:function(e){var s,e=this._getAllNodesWithTag(e,[\\"script\\"]);return this._forEachNode(e,function(e){if(!s&&\\"application/ld+json\\"===e.getAttribute(\\"type\\"))try{var t,i,a,n=e.textContent.replace(/^\\\\s*<!\\\\[CDATA\\\\[|\\\\]\\\\]>\\\\s*$/g,\\"\\"),r=JSON.parse(n);return r[\\"@context\\"]&&r[\\"@context\\"].match(/^https?\\\\:\\\\/\\\\/schema\\\\.org$/)?(r=!r[\\"@type\\"]&&Array.isArray(r[\\"@graph\\"])?r[\\"@graph\\"].find(function(e){return(e[\\"@type\\"]||\\"\\").match(this.REGEXPS.jsonLdArticleTypes)}):r)&&r[\\"@type\\"]&&r[\\"@type\\"].match(this.REGEXPS.jsonLdArticleTypes)?(s={},\\"string\\"==typeof r.name&&\\"string\\"==typeof r.headline&&r.name!==r.headline?(t=this._getArticleTitle(),i=.75<this._textSimilarity(r.name,t),a=.75<this._textSimilarity(r.headline,t),s.title=a&&!i?r.headline:r.name):\\"string\\"==typeof r.name?s.title=r.name.trim():\\"string\\"==typeof r.headline&&(s.title=r.headline.trim()),r.author&&(\\"string\\"==typeof r.author.name?s.byline=r.author.name.trim():Array.isArray(r.author)&&r.author[0]&&\\"string\\"==typeof r.author[0].name&&(s.byline=r.author.filter(function(e){return e&&\\"string\\"==typeof e.name}).map(function(e){return e.name.trim()}).join(\\", \\"))),\\"string\\"==typeof r.description&&(s.excerpt=r.description.trim()),r.publisher&&\\"string\\"==typeof r.publisher.name&&(s.siteName=r.publisher.name.trim()),void(\\"string\\"==typeof r.datePublished&&(s.datePublished=r.datePublished.trim()))):void 0:void 0}catch(e){this.log(e.message)}}),s||{}},_getArticleMetadata:function(e){var t={},r={},i=this._doc.getElementsByTagName(\\"meta\\"),s=/\\\\s*(article|dc|dcterm|og|twitter)\\\\s*:\\\\s*(author|creator|description|published_time|title|site_name)\\\\s*/gi,l=/^\\\\s*(?:(dc|dcterm|og|twitter|weibo:(article|webpage))\\\\s*[\\\\.:]\\\\s*)?(author|creator|description|title|site_name)\\\\s*$/i;return this._forEachNode(i,function(e){var t,i,a=e.getAttribute(\\"name\\"),n=e.getAttribute(\\"property\\"),e=e.getAttribute(\\"content\\");e&&(i=t=null,n&&(t=n.match(s))&&(i=t[0].toLowerCase().replace(/\\\\s/g,\\"\\"),r[i]=e.trim()),!t&&a&&l.test(a)&&(i=a,e&&(i=i.toLowerCase().replace(/\\\\s/g,\\"\\").replace(/\\\\./g,\\":\\"),r[i]=e.trim())))}),t.title=e.title||r[\\"dc:title\\"]||r[\\"dcterm:title\\"]||r[\\"og:title\\"]||r[\\"weibo:article:title\\"]||r[\\"weibo:webpage:title\\"]||r.title||r[\\"twitter:title\\"],t.title||(t.title=this._getArticleTitle()),t.byline=e.byline||r[\\"dc:creator\\"]||r[\\"dcterm:creator\\"]||r.author,t.excerpt=e.excerpt||r[\\"dc:description\\"]||r[\\"dcterm:description\\"]||r[\\"og:description\\"]||r[\\"weibo:article:description\\"]||r[\\"weibo:webpage:description\\"]||r.description||r[\\"twitter:description\\"],t.siteName=e.siteName||r[\\"og:site_name\\"],t.publishedTime=e.datePublished||r[\\"article:published_time\\"]||null,t.title=this._unescapeHtmlEntities(t.title),t.byline=this._unescapeHtmlEntities(t.byline),t.excerpt=this._unescapeHtmlEntities(t.excerpt),t.siteName=this._unescapeHtmlEntities(t.siteName),t.publishedTime=this._unescapeHtmlEntities(t.publishedTime),t},_isSingleImage:function(e){return\\"IMG\\"===e.tagName||1===e.children.length&&\\"\\"===e.textContent.trim()&&this._isSingleImage(e.children[0])},_unwrapNoscriptImages:function(o){var e=Array.from(o.getElementsByTagName(\\"img\\")),e=(this._forEachNode(e,function(e){for(var t=0;t<e.attributes.length;t++){var i=e.attributes[t];switch(i.name){case\\"src\\":case\\"srcset\\":case\\"data-src\\":case\\"data-srcset\\":return}if(/\\\\.(jpg|jpeg|png|webp)/i.test(i.value))return}e.parentNode.removeChild(e)}),Array.from(o.getElementsByTagName(\\"noscript\\")));this._forEachNode(e,function(e){var t=o.createElement(\\"div\\");if(t.innerHTML=e.innerHTML,this._isSingleImage(t)){var i=e.previousElementSibling;if(i&&this._isSingleImage(i)){for(var a=i,n=(\\"IMG\\"!==a.tagName&&(a=i.getElementsByTagName(\\"img\\")[0]),t.getElementsByTagName(\\"img\\")[0]),r=0;r<a.attributes.length;r++){var s,l=a.attributes[r];\\"\\"===l.value||\\"src\\"!==l.name&&\\"srcset\\"!==l.name&&!/\\\\.(jpg|jpeg|png|webp)/i.test(l.value)||n.getAttribute(l.name)===l.value||(s=l.name,n.hasAttribute(s)&&(s=\\"data-old-\\"+s),n.setAttribute(s,l.value))}e.parentNode.replaceChild(t.firstElementChild,i)}}})},_removeScripts:function(e){this._removeNodes(this._getAllNodesWithTag(e,[\\"script\\",\\"noscript\\"]))},_hasSingleTagInsideElement:function(e,t){return 1==e.children.length&&e.children[0].tagName===t&&!this._someNode(e.childNodes,function(e){return e.nodeType===this.TEXT_NODE&&this.REGEXPS.hasContent.test(e.textContent)})},_isElementWithoutContent:function(e){return e.nodeType===this.ELEMENT_NODE&&0==e.textContent.trim().length&&(0==e.children.length||e.children.length==e.getElementsByTagName(\\"br\\").length+e.getElementsByTagName(\\"hr\\").length)},_hasChildBlockElement:function(e){return this._someNode(e.childNodes,function(e){return this.DIV_TO_P_ELEMS.has(e.tagName)||this._hasChildBlockElement(e)})},_isPhrasingContent:function(e){return e.nodeType===this.TEXT_NODE||-1!==this.PHRASING_ELEMS.indexOf(e.tagName)||(\\"A\\"===e.tagName||\\"DEL\\"===e.tagName||\\"INS\\"===e.tagName)&&this._everyNode(e.childNodes,this._isPhrasingContent)},_isWhitespace:function(e){return e.nodeType===this.TEXT_NODE&&0===e.textContent.trim().length||e.nodeType===this.ELEMENT_NODE&&\\"BR\\"===e.tagName},_getInnerText:function(e,t){t=void 0===t||t;e=e.textContent.trim();return t?e.replace(this.REGEXPS.normalize,\\" \\"):e},_getCharCount:function(e,t){return t=t||\\",\\",this._getInnerText(e).split(t).length-1},_cleanStyles:function(e){if(e&&\\"svg\\"!==e.tagName.toLowerCase()){for(var t=0;t<this.PRESENTATIONAL_ATTRIBUTES.length;t++)e.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[t]);-1!==this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.indexOf(e.tagName)&&(e.removeAttribute(\\"width\\"),e.removeAttribute(\\"height\\"));for(var i=e.firstElementChild;null!==i;)this._cleanStyles(i),i=i.nextElementSibling}},_getLinkDensity:function(e){var t=this._getInnerText(e).length;if(0===t)return 0;var i=0;return this._forEachNode(e.getElementsByTagName(\\"a\\"),function(e){var t=e.getAttribute(\\"href\\"),t=t&&this.REGEXPS.hashUrl.test(t)?.3:1;i+=this._getInnerText(e).length*t}),i/t},_getClassWeight:function(e){if(!this._flagIsActive(this.FLAG_WEIGHT_CLASSES))return 0;var t=0;return\\"string\\"==typeof e.className&&\\"\\"!==e.className&&(this.REGEXPS.negative.test(e.className)&&(t-=25),this.REGEXPS.positive.test(e.className)&&(t+=25)),\\"string\\"==typeof e.id&&\\"\\"!==e.id&&(this.REGEXPS.negative.test(e.id)&&(t-=25),this.REGEXPS.positive.test(e.id)&&(t+=25)),t},_clean:function(e,t){var i=-1!==[\\"object\\",\\"embed\\",\\"iframe\\"].indexOf(t);this._removeNodes(this._getAllNodesWithTag(e,[t]),function(e){if(i){for(var t=0;t<e.attributes.length;t++)if(this._allowedVideoRegex.test(e.attributes[t].value))return!1;if(\\"object\\"===e.tagName&&this._allowedVideoRegex.test(e.innerHTML))return!1}return!0})},_hasAncestorTag:function(e,t,i,a){i=i||3,t=t.toUpperCase();for(var n=0;e.parentNode;){if(0<i&&i<n)return!1;if(e.parentNode.tagName===t&&(!a||a(e.parentNode)))return!0;e=e.parentNode,n++}return!1},_getRowAndColumnCount:function(e){for(var t=0,i=0,a=e.getElementsByTagName(\\"tr\\"),n=0;n<a.length;n++){var r=a[n].getAttribute(\\"rowspan\\")||0;t+=(r=r&&parseInt(r,10))||1;for(var s=0,l=a[n].getElementsByTagName(\\"td\\"),o=0;o<l.length;o++){var h=l[o].getAttribute(\\"colspan\\")||0;s+=(h=h&&parseInt(h,10))||1}i=Math.max(i,s)}return{rows:t,columns:i}},_markDataTables:function(e){for(var t=e.getElementsByTagName(\\"table\\"),i=0;i<t.length;i++){var a,n=t[i];\\"presentation\\"==n.getAttribute(\\"role\\")?n._readabilityDataTable=!1:\\"0\\"==n.getAttribute(\\"datatable\\")?n._readabilityDataTable=!1:n.getAttribute(\\"summary\\")||(a=n.getElementsByTagName(\\"caption\\")[0])&&0<a.childNodes.length?n._readabilityDataTable=!0:[\\"col\\",\\"colgroup\\",\\"tfoot\\",\\"thead\\",\\"th\\"].some(function(e){return!!n.getElementsByTagName(e)[0]})?(this.log(\\"Data table because found data-y descendant\\"),n._readabilityDataTable=!0):n.getElementsByTagName(\\"table\\")[0]?n._readabilityDataTable=!1:10<=(a=this._getRowAndColumnCount(n)).rows||4<a.columns?n._readabilityDataTable=!0:n._readabilityDataTable=10<a.rows*a.columns}},_fixLazyImages:function(e){this._forEachNode(this._getAllNodesWithTag(e,[\\"img\\",\\"picture\\",\\"figure\\"]),function(e){if(e.src&&this.REGEXPS.b64DataUrl.test(e.src)){if(\\"image/svg+xml\\"===this.REGEXPS.b64DataUrl.exec(e.src)[1])return;for(var t,i=!1,a=0;a<e.attributes.length;a++){var n=e.attributes[a];if(\\"src\\"!==n.name&&/\\\\.(jpg|jpeg|png|webp)/i.test(n.value)){i=!0;break}}i&&(t=e.src.search(/base64\\\\s*/i)+7,e.src.length-t<133&&e.removeAttribute(\\"src\\"))}if(!(e.src||e.srcset&&\\"null\\"!=e.srcset)||-1!==e.className.toLowerCase().indexOf(\\"lazy\\"))for(var r,s,l=0;l<e.attributes.length;l++)\\"src\\"!==(n=e.attributes[l]).name&&\\"srcset\\"!==n.name&&\\"alt\\"!==n.name&&(r=null,/\\\\.(jpg|jpeg|png|webp)\\\\s+\\\\d/.test(n.value)?r=\\"srcset\\":/^\\\\s*\\\\S+\\\\.(jpg|jpeg|png|webp)\\\\S*\\\\s*$/.test(n.value)&&(r=\\"src\\"),r&&(\\"IMG\\"===e.tagName||\\"PICTURE\\"===e.tagName?e.setAttribute(r,n.value):\\"FIGURE\\"!==e.tagName||this._getAllNodesWithTag(e,[\\"img\\",\\"picture\\"]).length||((s=this._doc.createElement(\\"img\\")).setAttribute(r,n.value),e.appendChild(s))))})},_getTextDensity:function(e,t){var i=this._getInnerText(e,!0).length;if(0===i)return 0;var a=0,e=this._getAllNodesWithTag(e,t);return this._forEachNode(e,e=>a+=this._getInnerText(e,!0).length),a/i},_cleanConditionally:function(e,N){this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)&&this._removeNodes(this._getAllNodesWithTag(e,[N]),function(e){function t(e){return e._readabilityDataTable}var i,a=\\"ul\\"===N||\\"ol\\"===N;if(a||(i=0,n=this._getAllNodesWithTag(e,[\\"ul\\",\\"ol\\"]),this._forEachNode(n,e=>i+=this._getInnerText(e).length),a=.9<i/this._getInnerText(e).length),\\"table\\"===N&&t(e))return!1;if(this._hasAncestorTag(e,\\"table\\",-1,t))return!1;if(this._hasAncestorTag(e,\\"code\\"))return!1;var n=this._getClassWeight(e);this.log(\\"Cleaning Conditionally\\",e);if(n+0<0)return!0;if(this._getCharCount(e,\\",\\")<10){for(var r=e.getElementsByTagName(\\"p\\").length,s=e.getElementsByTagName(\\"img\\").length,l=e.getElementsByTagName(\\"li\\").length-100,o=e.getElementsByTagName(\\"input\\").length,h=this._getTextDensity(e,[\\"h1\\",\\"h2\\",\\"h3\\",\\"h4\\",\\"h5\\",\\"h6\\"]),c=0,d=this._getAllNodesWithTag(e,[\\"object\\",\\"embed\\",\\"iframe\\"]),g=0;g<d.length;g++){for(var u=0;u<d[g].attributes.length;u++)if(this._allowedVideoRegex.test(d[g].attributes[u].value))return!1;if(\\"object\\"===d[g].tagName&&this._allowedVideoRegex.test(d[g].innerHTML))return!1;c++}var m=this._getLinkDensity(e),_=this._getInnerText(e).length,p=1<s&&r/s<.5&&!this._hasAncestorTag(e,\\"figure\\")||!a&&r<l||o>Math.floor(r/3)||!a&&h<.9&&_<25&&(0===s||2<s)&&!this._hasAncestorTag(e,\\"figure\\")||!a&&n<25&&.2<m||25<=n&&.5<m||1===c&&_<75||1<c;if(a&&p){for(var f=0;f<e.children.length;f++)if(1<e.children[f].children.length)return p;if(s==e.getElementsByTagName(\\"li\\").length)return!1}return p}return!1})},_cleanMatchedNodes:function(e,t){for(var i=this._getNextNode(e,!0),a=this._getNextNode(e);a&&a!=i;)a=t.call(this,a,a.className+\\" \\"+a.id)?this._removeAndGetNext(a):this._getNextNode(a)},_cleanHeaders:function(e){e=this._getAllNodesWithTag(e,[\\"h1\\",\\"h2\\"]);this._removeNodes(e,function(e){var t=this._getClassWeight(e)<0;return t&&this.log(\\"Removing header with low class weight:\\",e),t})},_headerDuplicatesTitle:function(e){if(\\"H1\\"!=e.tagName&&\\"H2\\"!=e.tagName)return!1;e=this._getInnerText(e,!1);return this.log(\\"Evaluating similarity of header:\\",e,this._articleTitle),.75<this._textSimilarity(this._articleTitle,e)},_flagIsActive:function(e){return 0<(this._flags&e)},_removeFlag:function(e){this._flags=this._flags&~e},_isProbablyVisible:function(e){return(!e.style||\\"none\\"!=e.style.display)&&(!e.style||\\"hidden\\"!=e.style.visibility)&&!e.hasAttribute(\\"hidden\\")&&(!e.hasAttribute(\\"aria-hidden\\")||\\"true\\"!=e.getAttribute(\\"aria-hidden\\")||e.className&&e.className.indexOf&&-1!==e.className.indexOf(\\"fallback-image\\"))},parse:function(){if(0<this._maxElemsToParse){var e=this._doc.getElementsByTagName(\\"*\\").length;if(e>this._maxElemsToParse)throw new Error(\\"Aborting parsing document; \\"+e+\\" elements found\\")}this._unwrapNoscriptImages(this._doc);var e=this._disableJSONLD?{}:this._getJSONLD(this._doc),e=(this._removeScripts(this._doc),this._prepDocument(),this._getArticleMetadata(e)),t=(this._articleTitle=e.title,this._grabArticle());if(!t)return null;this.log(\\"Grabbed: \\"+t.innerHTML),this._postProcessContent(t),e.excerpt||0<(i=t.getElementsByTagName(\\"p\\")).length&&(e.excerpt=i[0].textContent.trim());var i=t.textContent;return{title:this._articleTitle,byline:e.byline||this._articleByline,dir:this._articleDir,lang:this._articleLang,content:this._serializer(t),textContent:i,length:i.length,excerpt:e.excerpt,siteName:e.siteName||this._articleSiteName,publishedTime:e.publishedTime}}},\\"object\\"==typeof module&&(module.exports=Readability);"',
);

export const INJECT_FUNCS = `
function briefImgs(elem) {
	const imageTags = Array.from((elem || document).querySelectorAll('img[src]'));

	let linkPreferredSrc = x.src;
  if (linkPreferredSrc.startsWith('data:')) {
    if (typeof x.dataset?.src === 'string' && !x.dataset.src.startsWith('data:')) {
      linkPreferredSrc = x.dataset.src;
    }
  }

	return imageTags.map((x)=> {
		try {
			return {
				src:  new URL(linkPreferredSrc, document.baseURI).toString(),
				loaded: x.complete,
				width: x.width,
				height: x.height,
				naturalWidth: x.naturalWidth,
				naturalHeight: x.naturalHeight,
				alt: x.alt || x.title,
			};
		} catch {
			return;
		}
	}).filter(Boolean);
}

function cloneAndExpandShadowRoots(rootElement = document.documentElement) {
  // Create a shallow clone of the root element
  const clone = rootElement.cloneNode(false);
  // Function to process an element and its shadow root
  function processShadowRoot(original, cloned) {
    if (original.shadowRoot && original.shadowRoot.mode === 'open') {
      shadowDomPresents = true;
      const shadowContent = document.createDocumentFragment();

      // Clone shadow root content normally
      original.shadowRoot.childNodes.forEach(childNode => {
        const clonedNode = childNode.cloneNode(true);
        shadowContent.appendChild(clonedNode);
      });

      // Handle slots
      const slots = shadowContent.querySelectorAll('slot');
      slots.forEach(slot => {
        const slotName = slot.getAttribute('name') || '';
        const assignedElements = original.querySelectorAll(
          slotName ? \`[slot="\${slotName}"]\` : ':not([slot])'
        );

        if (assignedElements.length > 0) {
          const slotContent = document.createDocumentFragment();
          assignedElements.forEach(el => {
            const clonedEl = el.cloneNode(true);
            slotContent.appendChild(clonedEl);
          });
          slot.parentNode.replaceChild(slotContent, slot);
        } else if (!slotName) {
          // Keep default slot content
          // No need to do anything as it's already cloned
        }
      });

      cloned.appendChild(shadowContent);
    }
  }

  // Use a TreeWalker on the original root to clone the entire structure
  const treeWalker = document.createTreeWalker(
    rootElement,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );

  const elementMap = new Map([[rootElement, clone]]);

  let currentNode;
  while (currentNode = treeWalker.nextNode()) {
    const parentClone = elementMap.get(currentNode.parentNode);
    const clonedNode = currentNode.cloneNode(false);
    parentClone.appendChild(clonedNode);

    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      elementMap.set(currentNode, clonedNode);
      processShadowRoot(currentNode, clonedNode);
    }
  }

  return clone;
}

function shadowDomPresent(rootElement = document.documentElement) {
  const elems = rootElement.querySelectorAll('*');
  for (const x of elems) {
    if (x.shadowRoot && x.shadowRoot.mode === 'open') {
      return true;
    }
  }
  return false;
}

function giveSnapshot() {
	let parsed;

	try {
		parsed = new Readability(document.cloneNode(true)).parse();
	} catch (err) {
		void 0;
	}

  const r = {
    title: document.title,
    description: document.head?.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    href: document.location.href,
    html: document.documentElement?.outerHTML,
    text: document.body?.innerText,
    shadowExpanded: shadowDomPresent() ? cloneAndExpandShadowRoots()?.outerHTML : undefined,
    parsed,
    imgs: [],
  };

  if (document.baseURI !== r.href) {
    r.rebase = document.baseURI;
  }
  if (parsed && parsed.content) {
    const elem = document.createElement('div');
    elem.innerHTML = parsed.content;
    r.imgs = briefImgs(elem);
  } else {
    const allImgs = briefImgs();
    if (allImgs.length === 1) {
      r.imgs = allImgs;
    }
  }

	return r;
}

window.giveSnapshot = giveSnapshot;
window.briefImgs = briefImgs;
`.trim();

export const EXECUTE_SNAPSHOT = `
let aftershot = undefined;

const handlePageLoad = () => {
  if (document.readyState !== 'complete') {
    return;
  }
  const parsed = giveSnapshot();
  window.reportSnapshot(parsed);
  if (!parsed.text) {
    if (aftershot) {
      clearTimeout(aftershot);
    }
    aftershot = setTimeout(() => {
    const r = giveSnapshot();
      if (r && r.text) {
        window.reportSnapshot(r);
      }
    }, 500);
  }
};

document.addEventListener('readystatechange', handlePageLoad);
document.addEventListener('load', handlePageLoad);
`.trim();

export const WORKER_PROTECTION = `
function isDevToolsScript() {
	var stack = new Error().stack;
	return stack.includes('devtool');
}

Date.prototype.originalGetTime = Date.prototype.getTime;
Date.prototype.getTime = function () {
	if (!isDevToolsScript()) {
		return this.originalGetTime();
	}
	return 0;
}

const originalOnMessageSetter = Object.getOwnPropertyDescriptor(Worker.prototype, 'onmessage').set;
Object.defineProperty(Worker.prototype, 'onmessage', {
	set: function (fn) {
			if (!isDevToolsScript()) {
					originalOnMessageSetter.call(this, fn);
					return;
			}
			newFn = (ev) => {
					ev.data.time = 0;
					fn(ev);
			}
			originalOnMessageSetter.call(this, newFn);
	}
});`.trim();

export const TURNSTILE_SOLVER = `
(function() {
	async function clickTurnstile() {
		const delay = async (milliseconds) => await new Promise(resolve => setTimeout(resolve, milliseconds));

		function simulateMouseClick(element, clientX = null, clientY = null) {
			if (clientX === null || clientY === null) {
				const box = element.getBoundingClientRect();
				clientX = box.left + box.width / 2;
				clientY = box.top + box.height / 2;
			}

			if (isNaN(clientX) || isNaN(clientY)) {
				return;
			}

			// Send mouseover, mousedown, mouseup, click, mouseout
			const eventNames = [
				'mouseover',
				'mouseenter',
				'mousedown',
				'mouseup',
				'click',
				'mouseout',
			];

			eventNames.forEach((eventName) => {
				const detail = eventName === 'mouseover' ? 0 : 1;
				const event = new MouseEvent(eventName, {
					detail: detail,
					view: window,
					bubbles: true,
					cancelable: true,
					clientX: clientX,
					clientY: clientY,
				});
				element.dispatchEvent(event);
			});
		}

		while (true) {
			await delay(100);

			if (document.querySelector("#challenge-stage > div > label")) {
				simulateMouseClick(document.querySelector("#challenge-stage > div > label"));
			} else {
				break;
			}
		}
	}

	clickTurnstile();
})();`.trim();

export const STEALTH_PROTECTION = `
delete Function.prototype.toString;
delete Function.prototype.bind.apply;
delete Function.prototype.bind.call;
`.trim();
