(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{945:function(e,t,l){var a=l(2),n=l(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=t.ReportSickRoute=void 0;var o=n(l(85)),r=n(l(30)),i=n(l(16)),c=n(l(224)),u=l(36),s=a(l(1)),d=n(l(10)),f=n(l(29)),m=n(l(9)),b=n(l(948)),p=l(401),g=l(51),h=n(l(949)),v=n(l(14)),y=l(116),w=l(152),S=l(96),x=l(947),k=n(l(226)),C=l(403),E=l(154),B=l(399),P=l(155),V=d.default.create({screen:{flex:1,backgroundColor:"black",borderRadius:8,overflow:"hidden"},header:{position:"relative",height:64,width:"100%",flex:0,flexDirection:"row",paddingVertical:20,backgroundColor:"black",justifyContent:"center"},scrollViewStyle:{height:"100%"},scrollWrap:{flex:1},headerLabel:{flex:1},title:{textAlign:"center",fontSize:16,fontWeight:"500",color:"white"},listContainer:{},listSection:{paddingVertical:12,marginBottom:32},listSectionTitle:{fontSize:16,color:"white",paddingHorizontal:16,marginBottom:8,fontWeight:"700"},listSectionTitleSpacer:{borderBottomWidth:1,borderBottomColor:"rgb(42,42,42)",paddingBottom:8},closeButton:{position:"absolute",right:0,top:0,bottom:0,alignItems:"center"},closeButtonView:{padding:8},closeButtonText:{},submitButtonContainer:{position:"absolute",left:0,marginHorizontal:32,right:0,bottom:16},submitButton:{paddingHorizontal:16,paddingVertical:16,borderRadius:8,flex:1,overflow:"hidden",backgroundColor:"#0091FF",justifyContent:"center",alignItems:"center"},submitButtonLabel:{flex:1,fontSize:18,color:"white",fontWeight:"600",textAlign:"center"},learnMoreFooter:{paddingHorizontal:16,width:"100%",overflow:"visible"},learnMore:{fontWeight:"500",color:"#ccc",textDecorationColor:"rgba(100,100,100,0.55)",textDecorationLine:"underline",textDecorationStyle:"solid"}}),L=d.default.create({wrapper:{paddingVertical:12,paddingHorizontal:16,flexDirection:"row",position:"relative",borderBottomColor:"rgb(42,42,42)",borderBottomWidth:1},title:{fontSize:18,color:"white",flex:1},selectedTitle:{fontSize:18,color:"#0091FF",flex:1},checkboxContainer:{position:"absolute",top:0,bottom:0,right:16,justifyContent:"center"},checkbox:{width:20,height:16}}),T=function(e){var t=e.label,l=e.isSelected,a=e.value,n=e.onPress,o=s.useCallback((function(){n(a)}),[n,a]);return s.createElement(g.TouchableHighlight,{onPress:o},s.createElement(v.default.View,{style:L.wrapper},s.createElement(f.default,{style:l?L.selectedTitle:L.title},t),s.createElement(m.default,{style:L.checkboxContainer},s.createElement(S.BitmapIcon,{source:S.CHECK,style:[L.checkbox,{opacity:l?1:0}]}))))},z=function(){var e=(0,u.useNavigation)().goBack;return s.createElement(m.default,{style:[V.header,{paddingTop:16}]},s.createElement(m.default,{style:V.headerLabel},s.createElement(f.default,{style:V.title},"😷 Feeling sick?")),s.createElement(m.default,{style:V.closeButton},s.createElement(g.BorderlessButton,{onPress:e},s.createElement(v.default.View,{style:V.closeButtonView},s.createElement(B.CloseButtonImage,null)))))},F={symptoms:[{label:"Fever",value:"fever"},{label:"Shortness of breath",value:"short of breadth"},{label:"Cough",value:"cough"}],traveled_recently:[{label:"Yes",value:"true"},{label:"No",value:"false"}]},I=function(e){(0,c.default)(e);var t=s.useState([]),l=(0,i.default)(t,2),a=l[0],n=l[1],d=s.useState(""),S=(0,i.default)(d,2),B=S[0],L=S[1],I=(0,y.useSafeArea)().bottom,R=s.useState(!1),_=(0,i.default)(R,2),j=_[0],W=_[1],A=(0,u.useNavigation)().goBack,H=s.useCallback((function(){(0,C.openLink)("https://www.cdc.gov/coronavirus/2019-ncov/about/symptoms.html")}),[C.openLink]),M=s.useCallback((function(e){n((function(t){var l=(0,r.default)(t);return t.includes(e)?(l.splice(t.indexOf(e),1),l):(l.push(e),l)}))}),[n]),U=s.useCallback((function(e,t){var l=e.label,n=e.value,o=a.includes(n);return s.createElement(T,{label:l,key:n+"-"+o,value:n,isSelected:o,onPress:M})}),[a,M]),D=s.useCallback((function(e){L((function(t){return t===e?"false":"true"}))}),[L]),O=s.useCallback((function(e){var t=e.label,l=e.value,a=B===l;return s.createElement(T,{label:t,key:l+"-"+B,value:l,isSelected:a,onPress:L})}),[B,D]),q=s.useContext(P.UserLocationContext),N=s.useCallback((function(){var e,t,l,n,r,i;return o.default.async((function(c){for(;;)switch(c.prev=c.next){case 0:if(0!==a.length){c.next=3;break}return b.default.alert("If you have any symptoms, please list them."),c.abrupt("return");case 3:return e=(0,p.getUniqueId)(),W(!0),c.next=7,o.default.awrap((0,h.default)());case 7:if(t=c.sent,l=q.latitude,n=q.longitude,r=q.locationAccuracy,l&&n){c.next=26;break}return c.next=14,o.default.awrap(k.default.requestPermission({ios:"whenInUse",android:{detail:"coarse"}}));case 14:if(!c.sent){c.next=26;break}return c.prev=16,c.next=19,o.default.awrap(k.default.getLatestLocation({timeout:1e4}));case 19:(i=c.sent)&&(l=i.latitude,n=i.longitude,r=i.accuracy),c.next=26;break;case 23:c.prev=23,c.t0=c.catch(16),console.warn("Continuing without location");case 26:return c.prev=26,c.next=29,o.default.awrap((0,w.createUserReport)({ipAddress:t,deviceUid:e,latitude:l,longitude:n,locationAccuracy:r,symptoms:a,traveledRecently:B}));case 29:c.sent?(b.default.alert("Submitted."),(0,E.sendLightFeedback)(),A()):(W(!1),b.default.alert("Something went wrong","Please try again")),c.next=38;break;case 33:c.prev=33,c.t1=c.catch(26),W(!1),b.default.alert("Something went wrong","Please try again"),console.error(c.t1);case 38:case"end":return c.stop()}}),null,null,[[16,23],[26,33]])}),[p.getUniqueId,a,W,B,w.createUserReport,q,h.default,k.default.getLatestLocation,k.default.requestPermission,A]);return s.createElement(m.default,{style:V.screen},s.createElement(z,null),s.createElement(m.default,{style:V.scrollWrap},s.createElement(x.ScrollView,{contentInset:{bottom:100,top:0,left:0,right:0},style:V.scrollViewStyle},s.createElement(m.default,{style:V.listSection},s.createElement(f.default,{style:V.listSectionTitle},"What symptoms do you have?"),s.createElement(m.default,{style:V.listSectionTitleSpacer}),F.symptoms.map(U)),s.createElement(m.default,{style:V.listSection},s.createElement(f.default,{style:V.listSectionTitle},"Have you traveled recently?"),s.createElement(m.default,{style:V.listSectionTitleSpacer}),F.traveled_recently.map(O)),s.createElement(g.BorderlessButton,{style:V.learnMoreFooter,onPress:H},s.createElement(v.default.View,null,s.createElement(f.default,{style:V.learnMore},"Learn more about COVID-19 from the CDC")))),s.createElement(g.RectButton,{onPress:N,enabled:!j,style:[V.submitButtonContainer,{bottom:I||16}]},s.createElement(v.default.View,{style:V.submitButton},s.createElement(f.default,{adjustsFontSizeToFit:!0,style:V.submitButtonLabel},"Submit")))))};t.ReportSickRoute=I;var R=I;t.default=R},947:function(e,t,l){var a=l(0);Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"ScrollView",{enumerable:!0,get:function(){return n.default}});var n=a(l(69))},948:function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.default=t.Alert=void 0;var l={alert:function(e){return window.alert(e)}};t.Alert=l;var a=l;t.default=a},949:function(e,t,l){var a=l(0);Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=a(l(85));t.default=function(e){var t,l;return n.default.async((function(a){for(;;)switch(a.prev=a.next){case 0:return a.prev=0,a.next=3,n.default.awrap(fetch(e||"https://api.ipify.org"));case 3:return t=a.sent,l=t.text(),a.abrupt("return",l);case 8:throw a.prev=8,a.t0=a.catch(0),"Unable to get IP address.";case 11:case"end":return a.stop()}}),null,null,[[0,8]])}}}]);
//# sourceMappingURL=2-8700c9f15a73cc655635.bundle.js.map