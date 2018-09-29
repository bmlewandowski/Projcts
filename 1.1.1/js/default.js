//Create the Angular Application and load each module
var angularApp = angular.module('angularApp', ['ngRoute', 'ngAnimate', 'ngMessages', 'ngTouch', 'ngTagsInput', 'angucomplete-alt', 'firebase'])

//Run at the start of the Angular Application
angularApp.run(function ($rootScope, $timeout, $location, Account, Auth, Comment, Social, Modal, Globals) {

    //Global application state
    $rootScope.status = '';

    //Global upload progress
    $rootScope.progress = 0;

    //Routing Handler for monitoring routechanges
    $rootScope.$on("$routeChangeStart", function (event, next, current) {

//        //if the Route data object is not empty...
//        if (next.routedata !== undefined) {
//
//            //populate the route data from the route
//            $rootScope.routedata = next.routedata;
//            
//            //hide side navpanel
//            $rootScope.navpanel_hide();
//            
//            //hide searchbar
//            $rootScope.searchpanel_state = 'searchpanel_hide';
//            
//            //Use the Modal Factory to unload the modal
//            //Modal.unload();
//
//        };
//        
//        //If your loading the route from the outside:
//        if (typeof current === "undefined") {
//
//            //If you where trying to access a secure area:
//            if (next.secure == true) {
//
//                //And if your not logged in:
//                if (!firebase.auth().currentUser) {
//
//                    Globals.loginRedirect = next.originalPath.replace(":routevar", next.params.routevar);
//
//                    $location.path(/secure/);
//
//                }
//
//            };
//
//        } else { //Your already on the site and just changing routes:
//
//            //before we move routes, blank out the nextURL - this ensures the nextURL does not have old data. 
//            Globals.nextURL = null;
//
//            //If you headed to a secure area:
//            if (next.secure == true) {
//
//                //And if your not logged in:
//                if (!Auth.$getAuth()) {
//
//                    //stop the route change:
//                    event.preventDefault();
//
//                    Globals.loginRedirect = next.originalPath.replace(":routevar", next.params.routevar);
//
//                    Modal.load("modal_content_secure");
//
//                }
//
//            };
//
//        };

    });

    //Global Functions to Handle the Left Navigation Panel
    $rootScope.navpanel_state = true;

    $rootScope.navpanel_hide = function () {

        $rootScope.navpanel_state = true;

    };

    $rootScope.navpanel_show = function () {

        $rootScope.navpanel_state = false;

    };

    //Global Functions to Handle the Search Panel
    $rootScope.searchpanel_state = 'searchpanel_hide';

    $rootScope.searchpanel_toggle = function () {

        if ($rootScope.searchpanel_state == 'searchpanel_hide') {

            $rootScope.searchpanel_state = 'searchpanel_show';

        } else {

            $rootScope.searchpanel_state = 'searchpanel_hide';
        };

    };

    // Monitor auth state changes, add the user data to scope
    Auth.$onAuthStateChanged(function (firebaseUser) {

        $rootScope.firebaseUser = firebaseUser;

    });

    //Logout Function
    $rootScope.logout = function () {

        Account.logout();

        $location.path('/');

    };

    //Global Autocomplete    
    $rootScope.suggests = [];

    //Get Autocomplete Tags
    firebase.database().ref("tags").on("child_added", function (tagdata) {

        //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
        $timeout(function () {
            $rootScope.suggests.push({
                id: tagdata.key,
                title: tagdata.val().title
            });

        }, 0);
    });

    //Autocomplete Selected Function
    $rootScope.searchSelected = function (selected) {
        if (selected) {
            $location.path('/tagged/' + selected.originalObject.id);
        } else {
            //console.log('cleared');
        }
    };

    //Social Functions

    $rootScope.social = function (action, id, type, owner, target, targetid) {

        Social.social(action, id, type, owner, target, targetid);
    }

    $rootScope.unsocial = function (action, id, type, owner, target, targetid) {

        Social.unsocial(action, id, type, owner, target, targetid);

    }
    
    $rootScope.addcomment = function(action, id, type, owner, reply) {
          
        Comment.create($rootScope.addcomment.message, action, id, type, owner, reply)

        //Factory call succeeded
        .then(function (data) {

            //Clear messagebox
            $rootScope.addcomment.message = '';

        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        }); 

    }

});