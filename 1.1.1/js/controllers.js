//General Area Controllers

angularApp.controller("homeCtrl", function ($scope, $timeout ,$interval, $firebaseArray) {
    
    //Get Homepage Projects
//    var project_iconsRef = firebase.database().ref().child("project_icons");
//    $scope.project_icons = $firebaseArray(project_iconsRef);
    
    //Banner Image Number
    $scope.banner = 1;

    //Initialize the slide changer to run periodically.
    $scope.changeSlide = $interval(function () {

        $scope.banner = $scope.banner + 1

        if ($scope.banner > 6) {
            $scope.banner = 1
        };

    }, 5000);

    //Function to select a slide with the buttons and stop the slide changer. 
    $scope.selectSlide = function (slideNumber) {

        //set the banner to the requested slide
        $scope.banner = slideNumber;

        //Kill the auto slide changer
        $interval.cancel($scope.changeSlide);

    };
    
    //handle loading animation
    $scope.loading = true;
    
    //Initialize Project Icons Model
    $scope.project_icons = [];
    
    //For each Project Index
    firebase.database().ref("project_icons").orderByChild("date_modified").limitToFirst(150).on("child_added", function(data) {
        //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
        $timeout(function() {
            
                    $scope.project_icons.push({
                        title: data.val().title,
                        image_servingURL:data.val().image_servingURL,
                        date_created:data.val().date_created,
                        date_modified:data.val().date_modified,
                        id: data.key
                    }); 
            
                        
//            if(data.val().counts)
//                {
//                    
//                    //Put the Project from Firebase into the Angualar Projects Model.     
//                    $scope.project_icons.push({
//                        title: data.val().title,
//                        image_servingURL:data.val().image_servingURL,
//                        created:data.val().created,
//                        modified:data.val().modified,
//                        likecount:data.val().counts.like,
//                        commentcount:data.val().counts.comment,
//                        id: data.key()
//                    });      
//                }
//            
//            else
//                {
//                    
//                    //Put the Project from Firebase into the Angualar Projects Model.     
//                    $scope.project_icons.push({
//                        title: data.val().title,
//                        image_servingURL:data.val().image_servingURL,
//                        created:data.val().created,
//                        modified:data.val().modified,
//                        id: data.key()
//                    });  
//                    
//                }
            
            
        }, 0);
        
        $scope.loading = false;
          
    }); 
    

});

angularApp.controller("loginCtrl", function ($scope, $location, Account, Globals) {

    //Initialize the Form Data Model
    $scope.form = {
        data: {
            email: '',
            password: ''
        },
        loading: false
    };
    
    //Randomize Welcome Message
    $scope.quotes = [
        {"text":"Everyone\'s been asking about ya"},
        {"text":"Back already? We knew you couldn\'t stay away"},
        {"text":"Hey, you\'re back! We were getting worried"},
        {"text":"Wait till you see what you missed"},
        {"text":"Can\'t wait to see what you\'ve been working on"},
        {"text":"How are things progressing?"},
        {"text":"We love the smell of spray paint in the morning"},
        {"text":"An Exacto and can of Krylon walk into a bar..."},
        {"text":"Lemme guess...the poster board didn\'t work out"},
        {"text":"Awww, we can\'t stay mad at you. come on in"},
        {"text":"Dude, we got a blowtorch!"},
        {"text":"Ever heard of an angry TIG welder?"},
        {"text":"You, uh, get that thing we sent ya?"},
        {"text":"Dunno, you left a pretty big mess behind last time"},
        {"text":"Hey, what\'s in that paper bag?"},
    ];

    $scope.randomquote = $scope.quotes[Math.floor(Math.random() * $scope.quotes.length)];

    //Function to call the Account Factory to log user in. 
    $scope.login = function () {

        //Set the Form to loading state
        $scope.form.loading = true;

        //Call the Account Factory
        Account.login($scope.form.data)

        //Login succeeded
        .then(function () {

            //Set the Form to Non-loading state
            $scope.form.loading = false;
            
            //Handle Redirects. 
            if (Globals.loginRedirect) {

                console.log(Globals.loginRedirect);

                $location.path(Globals.loginRedirect);

                Globals.loginRedirect = null;

            }
            
            else {
                
                //Re-direct the User to the Console 
                $location.path('/console/home/');                          
            }

        })

        //Account creation failed
        .catch(function (error) {

            //Set the Form to Non-loading state
            $scope.form.loading = false;

            //Update the form.error model with the Firebase Error code.
            $scope.form.error = error.code;

        });

    };

});

angularApp.controller("register_oneCtrl", function ($scope, $location, Account) {

    //Initialize the Form Data Model
    $scope.form = {
        data: {
            email: '',
            displayname: '',
            password: ''
        },
        loading: false
    };
    
    //Randomize Welcome Message
    $scope.quotes = [
        {"text":"Well well, look who\'s stepping up to the plate"},
        {"text":"Register for a free box of crayons...no, not really"},
        {"text":"One of us gooba gobble!"},
        {"text":"With titles and privileges by power vested and so forth"},
        {"text":"That\'s cute, I remember when I was a lurker"},
        {"text":"Alright, but you can\'t keep the training wheels"},
        {"text":"Decided to leave newb island?"},
        {"text":"Ready to make a mess?"},
        {"text":"Take this, it\'s dangerous to go alone"},
        {"text":"Now with sharpener on the back of the box"},
        {"text":"Come to the realization that you make stuff huh?"},
        {"text":"Creating an account is nothing, you\'ve built worlds"},
        {"text":"We saved some nice wallspace for ya"},
        {"text":"Ahh yes. The red pill"},
        {"text":"You can\'t hear it, but trumpets are playing right now"},
        {"text":"You just answered the question, \"Who\'s Awesome?\""}
    ];

    $scope.randomquote = $scope.quotes[Math.floor(Math.random() * $scope.quotes.length)];

    //Function to call the Account Factory and create a new user account. 
    $scope.register = function () {

        //Set the Form to loading state
        $scope.form.loading = true;

        //Call the Account Factory
        Account.register($scope.form.data)

        //Account creation succeeded
        .then(function (result) {

            //Set the Form to Non-loading state
            $scope.form.loading = false;

            //Re-direct the User to the first step of the onboarding process. 
            $location.path('/register/two/');

        })

        //Account creation failed
        .catch(function (error) {

            //Set the Form to Non-loading state
            $scope.form.loading = false;

            //Log the Error
            console.log(error.message);

        });

    };

});

angularApp.controller("register_twoCtrl", function ($scope, $rootScope, $location, Person, Image, Auth, $timeout) {

    //Function to Initialize the View to a ready state. 
    $scope.initialize = function () {

        //Initialize the Form Data Model
        $scope.form = {
            data: {},          
            loading: false,
            imagechanged: false,
            mode: 'selectimage'
        };

        //If there is no croppie active, then create an instance 
        if (!$scope.croppie) {

            //Create an instance of Croppie
            $scope.croppie = new Croppie(document.getElementById('cropworkspace'), {
                viewport: {
                    width: 500,
                    height: 500,
                    type: 'circle'
                },
                boundary: {
                    width: 600,
                    height: 600
                },
                enableExif: false,
            });

        };

        //Initialize the Image Workspace
        document.getElementById('image001').src = "/1.1.1/img/interface/tiles/tile_selectuserimage.png";

        //Initialize the File Input Element
        document.getElementById("file001").value = null;

        //Initialize the Progress Bar
        $rootScope.progress = 0;

    };

    //Function to call the Person Factory to update the Person images (full and icon). 
    $scope.updateUserImage = function () {

        //Set the form to loading mode
        $scope.form.mode = 'showprogress';

        //Call the Project Factory
        Person.image()

        //Project creation succeeded
        .then(function (result) {

            //Set the Global Application Status
            $rootScope.status = ""

            //Re-direct the User to the console projects page 
            $location.path('/console/home/');

        })

        //Project creation failed
        .catch(function (error) {

            //Set the Form to Non-loading state
            $scope.form.loading = false

        });

    };

    //Function to process the Crop
    $scope.crop = function () {

        //Set the form to loading mode
        $scope.form.mode = 'verifycrop';

        //Get the Results of the Crop
        $scope.croppie.result({
            type: 'base64',
            size: 'original',
            format: 'png',
            quality: 1,
            circle: false
        })

        //Crop Image Successful
        .then(function (cropresult) {

            //Set the Image to the newly read file
            document.getElementById('personfull').src = cropresult;

        });


        //Get the Results of the Crop
        $scope.croppie.result({
            type: 'base64',
            size: 'original',
            format: 'png',
            quality: 1,
            circle: true
        })

        //Crop Image Successful
        .then(function (cropresult2) {

            //Set the Image to the newly read file
            document.getElementById('personicon').src = cropresult2;

        });

    };

    //Initialize the View to a ready state. 
    $scope.initialize();

    //Setup a watcher to activate croppie when the user changes the image
    $scope.$watch('form.imagechanged', function () {

        //if the directive changed the image...
        if ($scope.form.imagechanged == true) {

            //reset the image changed flag
            $scope.form.imagechanged = false;

            //update the form mode to go to the crop image state
            $scope.form.mode = 'cropimage'

            $scope.croppie.bind({
                url: document.getElementById('image001').src
            });

        };

    }, true);

});


//Public Area Controllers

angularApp.controller("assetCtrl", function ($scope, $timeout, $location, $routeParams, Asset, Comment, Social) { //$sce
    
    //Function to Initialize the View to a ready state. 
    $scope.initialize = function () {
        
        //Initialize the UI Model
        $scope.ui = {
            description: 'less', //collapsed by default
            infopanel_state: false, //Hidden by default
            author: false //Hidden by default
        };
        
        //Initialize Social UI
        $scope.uistate = {
            socialcommands: 1,
            like: 'loading',
            follow: 'loading',
            flag: 'loading'
        };
        
        //Initialize the Plexus Model
        $scope.plexus = {};

        //Initialize the Comments Model
        $scope.comments = [];
        
        //Initialize scope for current url
        $scope.url = {};

        //Initialize current url for social
        $scope.url.current = $location.absUrl();
        
        //Initialize scopes for reply
        $scope.replycomment = {
            id: '0',
            text : '',
            owner : '',
            ownername : '',
            ownericon : '',
            date_created: ''
            }; 

        $scope.offsetTop = 0;
        $scope.images =[];
        $scope.count = {};
        $scope.current = {};
        $scope.show = 0;
        $scope.projectId = $routeParams.projectId;    
            
        //All Assets Factory
        Asset.readassetsextended($routeParams.projectId, $routeParams.projectId)
        .then(function (data) {
            $scope.images = data;

            //set count of images
            $scope.count = $scope.images.length;

            //map slides and select current
            $scope.current = ($scope.images.map(function (e) { return e.id; }).indexOf($routeParams.assetId));
            
            //call display of image
            $scope.showSlide($scope.current);

        });
        
        //Call Comments
        Comment.readcomments("asset", $routeParams.assetId)

        //Factory call succeeded
        .then(function (commentdata) {

            $scope.comments = commentdata;

            //add social plexus data to comments

            //If your logged in, then get the plexus data. (i.e. do I social this thing?)
            if (firebase.auth().currentUser) {

                angular.forEach($scope.comments, function (commentSnap) {

                    //var index = $scope.comments.map(function(e) { return e.id; }).indexOf($scope.comments);
                    var index = $scope.comments.map(function (e) {
                        return e.id;
                    }).indexOf(commentSnap.id);

                    firebase.database().ref("social_plexus").child(firebase.auth().currentUser.uid).child("comment").child(commentSnap.id).once("value", function (plexusSnapshot) {

                        //get the index of the current comment
                        var index = $scope.comments.map(function (e) {
                            return e.id;
                        }).indexOf(commentSnap.id);

                        //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
                        $timeout(function () {

                            //If there like data in the plexus...
                            if ((plexusSnapshot.val() !== null) && plexusSnapshot.val().hasOwnProperty('like')) {

                                //set the comments like status to "liked"
                                $scope.comments[index].likeStatus = "liked";

                            } else {

                                //set the comments like status to "not liked"
                                $scope.comments[index].likeStatus = "notliked";

                            };

                            //If there flag data in the plexus...
                            if ((plexusSnapshot.val() !== null) && plexusSnapshot.val().hasOwnProperty('flag')) {

                                //set the comments like status to "flagged"
                                $scope.comments[index].flagStatus = "flagged";

                            } else {

                                //set the comments flag status to "not flagged"
                                $scope.comments[index].flagStatus = "notflagged";

                            };

                        }, 0);

                    });

                })

            } else {

                angular.forEach($scope.comments, function (comments) {

                    //get the index of the current comment
                    var index = $scope.comments.map(function (e) {
                        return e.id;
                    }).indexOf(comments.id);

                    //set the comments like status to "logged out"
                    $scope.comments[index].likeStatus = "loggedout";
                    //set the comments flag status to "logged out"
                    $scope.comments[index].flagStatus = "loggedout";

                })

            };

        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });

        //Object Plexus Check

        //If you are logged in
        if (firebase.auth().currentUser) {

            //Get the current users Social Plexus of the Person they are looking at...   
            firebase.database().ref("social_plexus").child(firebase.auth().currentUser.uid).child("project").child($routeParams.projectId).on("value", function (plexusdata) {

                //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
                $timeout(function () {

                    $scope.plexus = plexusdata.val();

                    if ($scope.plexus) {

                        if ($scope.plexus.like) {
                            $scope.uistate.like = "liked"
                        } else {
                            $scope.uistate.like = "notliked"
                        }
                        if ($scope.plexus.follow) {
                            $scope.uistate.follow = "followed"
                        } else {
                            $scope.uistate.follow = "notfollowed"
                        }
                        if ($scope.plexus.flag) {
                            $scope.uistate.flag = "flagged"
                        } else {
                            $scope.uistate.flag = "notflagged"
                        }

                    } else {

                        $scope.uistate.like = "notliked";
                        $scope.uistate.follow = "notfollowed";
                        $scope.uistate.flag = "notflagged";

                    };

                }, 0);

            });

        } else //Otherwise, your not logged in, so set the buttons to logged out state. 
        {

            $scope.uistate.like = "loggedout";
            $scope.uistate.follow = "loggedout";
            $scope.uistate.flag = "loggedout";

        };

    };
    
    $scope.next = function () {
        
                if($scope.show === ($scope.count - 1)){
                   
                    $scope.show = 0;
                    //$scope.showSlide(0);            
                    //adjust route
                    $location.path("/project/" + $routeParams.projectId + "/asset/" + $scope.images[0].id);
                
                
                }else{
                                        
                    $scope.show = $scope.show + 1;
                    //$scope.showSlide($scope.show);
                    //adjust route 
                    $location.path("/project/" + $routeParams.projectId + "/asset/" + $scope.images[$scope.current + 1].id);
               
                }
        
        
    };
 
    $scope.prev = function () {
        
                if($scope.show === 0 ){
                    
                    //$scope.showSlide($scope.count - 1);
                    //adjust route
                    $location.path("/project/" + $routeParams.projectId + "/asset/" + $scope.images[$scope.count].id);
                    
                }else{
                    //$scope.showSlide($scope.show - 1);
                    //adjust route
                    $location.path("/project/" + $routeParams.projectId + "/asset/" + $scope.images[$scope.current - 1].id);
                }
        
    };
    
    $scope.showSlide=function(slidenum){
               // $timeout(function(){
                    $scope.show = slidenum;
              //  }, 100);

            };
    
    //Initialize the View to a ready state. 
    $scope.initialize();
    
    //Funtion to handle Comment Likes
    $scope.like = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments like status to "liked"
        $scope.comments[index].likeStatus = "liked";

        //Set the like in the DB
        Social.social("like", commentId, "comment", commentOwner, target, targetid);

    };

    //Function to handle Comment Unlikes
    $scope.unlike = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments like status to "notliked"
        $scope.comments[index].likeStatus = "notliked";

        //Set the like in the DB
        Social.unsocial("like", commentId, "comment", commentOwner, target, targetid);

    };

    //Funtion to handle Comment Flags
    $scope.flag = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments flag status to "flagged"
        $scope.comments[index].flagStatus = "flagged";

        //Set the flag in the DB
        Social.social("flag", commentId, "comment", commentOwner, target, targetid);

    };

    //Function to handle Comment Unflags
    $scope.unflag = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments flag status to "notflagged"
        $scope.comments[index].flagStatus = "notflagged";

        //Set the flag in the DB
        Social.unsocial("flag", commentId, "comment", commentOwner, target, targetid);

    };
        
    //Function to handle Reply
    $scope.reply = function (comment) {   

        $scope.replycomment.id = comment.id;
        $scope.replycomment.text = comment.text;
        $scope.replycomment.date_created = comment.date_created;
        $scope.replycomment.ownerid = comment.ownerid;
        $scope.replycomment.ownername = comment.ownername;
        $scope.replycomment.ownericon = comment.ownericon;

    };   
 
    //Function to handle Cancel Reply       
    $scope.cancelReply = function () {

        $scope.replycomment.id = '0'; 
        $scope.replycomment.text = '';   
        $scope.replycomment.date_created ='';
        $scope.replycomment.ownerid = '';
        $scope.replycomment.ownername = '';
        $scope.replycomment.ownericon = '';

    };  

    console.log('asset');

});

angularApp.controller("projectCtrl", function ($scope, $routeParams, $location, $timeout, Project, Comment, Social) {
    
    //Function to Initialize the View to a ready state. 
    $scope.initialize = function () {

        //Initialize the UI Model
        $scope.ui = {
            description: 'less', //collapsed by default
            infopanel_state: false, //Hidden by default
            author: false //Hidden by default
        };

        //Function to toggle the Info Panel
        $scope.infopanel_toggle = function () {

            if ($scope.ui.infopanel_state == false) {

                $scope.ui.infopanel_state = true;

            } else {

                $scope.ui.infopanel_state = false;
            };

        };

        //Initialize Social UI
        $scope.uistate = {
            socialcommands: 1,
            like: 'loading',
            follow: 'loading',
            flag: 'loading'
        };

        //Initialize the Plexus Model
        $scope.plexus = {};

        //Initialize the Comments Model
        $scope.comments = [];

        //Initialize scopes for tags
        $scope.tags = [];

        //Initialize scope for current url
        $scope.url = {};

        //Initialize current url for social
        $scope.url.current = $location.absUrl();
        
        //Initialize scopes for reply
        $scope.replycomment = {
            id: '0',
            text : '',
            owner : '',
            ownername : '',
            ownericon : '',
            date_created: ''
            }; 

        //Get Objects Tags
        firebase.database().ref("projects").child($routeParams.projectId).child("tags").on("child_added", function (tagobjectdata) {

            //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
            $timeout(function () {
                $scope.tags.push({
                    id: tagobjectdata.key,
                    title: tagobjectdata.val().title
                });

            }, 0);
        });

        //Initialize Project Model
        $scope.project = {};

        //Call Factory
        Project.readextended($routeParams.projectId)

        //Factory call succeeded
        .then(function (data) {

            $scope.project = data;

            //If logged in
            if (firebase.auth().currentUser)
                {
                    //If owner
                    if ($scope.project.owner == firebase.auth().currentUser.uid)
                        {
                        $scope.ui.author = true;
                        }

                }

        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });

        //Call Comments
        Comment.readcomments("project", $routeParams.projectId)

        //Factory call succeeded
        .then(function (commentdata) {

            $scope.comments = commentdata;

            //add social plexus data to comments

            //If your logged in, then get the plexus data. (i.e. do I social this thing?)
            if (firebase.auth().currentUser) {

                angular.forEach($scope.comments, function (commentSnap) {

                    //var index = $scope.comments.map(function(e) { return e.id; }).indexOf($scope.comments);
                    var index = $scope.comments.map(function (e) {
                        return e.id;
                    }).indexOf(commentSnap.id);

                    firebase.database().ref("social_plexus").child(firebase.auth().currentUser.uid).child("comment").child(commentSnap.id).once("value", function (plexusSnapshot) {

                        //get the index of the current comment
                        var index = $scope.comments.map(function (e) {
                            return e.id;
                        }).indexOf(commentSnap.id);

                        //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
                        $timeout(function () {

                            //If there like data in the plexus...
                            if ((plexusSnapshot.val() !== null) && plexusSnapshot.val().hasOwnProperty('like')) {

                                //set the comments like status to "liked"
                                $scope.comments[index].likeStatus = "liked";

                            } else {

                                //set the comments like status to "not liked"
                                $scope.comments[index].likeStatus = "notliked";

                            };

                            //If there flag data in the plexus...
                            if ((plexusSnapshot.val() !== null) && plexusSnapshot.val().hasOwnProperty('flag')) {

                                //set the comments like status to "flagged"
                                $scope.comments[index].flagStatus = "flagged";

                            } else {

                                //set the comments flag status to "not flagged"
                                $scope.comments[index].flagStatus = "notflagged";

                            };

                        }, 0);

                    });

                })

            } else {

                angular.forEach($scope.comments, function (comments) {

                    //get the index of the current comment
                    var index = $scope.comments.map(function (e) {
                        return e.id;
                    }).indexOf(comments.id);

                    //set the comments like status to "logged out"
                    $scope.comments[index].likeStatus = "loggedout";
                    //set the comments flag status to "logged out"
                    $scope.comments[index].flagStatus = "loggedout";

                })

            };

        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });

        //Object Plexus Check

        //If you are logged in
        if (firebase.auth().currentUser) {

            //Get the current users Social Plexus of the Person they are looking at...   
            firebase.database().ref("social_plexus").child(firebase.auth().currentUser.uid).child("project").child($routeParams.projectId).on("value", function (plexusdata) {

                //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
                $timeout(function () {

                    $scope.plexus = plexusdata.val();

                    if ($scope.plexus) {

                        if ($scope.plexus.like) {
                            $scope.uistate.like = "liked"
                        } else {
                            $scope.uistate.like = "notliked"
                        }
                        if ($scope.plexus.follow) {
                            $scope.uistate.follow = "followed"
                        } else {
                            $scope.uistate.follow = "notfollowed"
                        }
                        if ($scope.plexus.flag) {
                            $scope.uistate.flag = "flagged"
                        } else {
                            $scope.uistate.flag = "notflagged"
                        }

                    } else {

                        $scope.uistate.like = "notliked";
                        $scope.uistate.follow = "notfollowed";
                        $scope.uistate.flag = "notflagged";

                    };

                }, 0);

            });

        } else //Otherwise, your not logged in, so set the buttons to logged out state. 
        {

            $scope.uistate.like = "loggedout";
            $scope.uistate.follow = "loggedout";
            $scope.uistate.flag = "loggedout";

        };

    };
    
    //Initialize the View to a ready state. 
    $scope.initialize();

    //Funtion to handle Comment Likes
    $scope.like = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments like status to "liked"
        $scope.comments[index].likeStatus = "liked";

        //Set the like in the DB
        Social.social("like", commentId, "comment", commentOwner, target, targetid);

    };

    //Function to handle Comment Unlikes
    $scope.unlike = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments like status to "notliked"
        $scope.comments[index].likeStatus = "notliked";

        //Set the like in the DB
        Social.unsocial("like", commentId, "comment", commentOwner, target, targetid);

    };

    //Funtion to handle Comment Flags
    $scope.flag = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments flag status to "flagged"
        $scope.comments[index].flagStatus = "flagged";

        //Set the flag in the DB
        Social.social("flag", commentId, "comment", commentOwner, target, targetid);

    };

    //Function to handle Comment Unflags
    $scope.unflag = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments flag status to "notflagged"
        $scope.comments[index].flagStatus = "notflagged";

        //Set the flag in the DB
        Social.unsocial("flag", commentId, "comment", commentOwner, target, targetid);

    };
        
    //Function to handle Reply
    $scope.reply = function (comment) {   

        $scope.replycomment.id = comment.id;
        $scope.replycomment.text = comment.text;
        $scope.replycomment.date_created = comment.date_created;
        $scope.replycomment.ownerid = comment.ownerid;
        $scope.replycomment.ownername = comment.ownername;
        $scope.replycomment.ownericon = comment.ownericon;

    };   
 
    //Function to handle Cancel Reply       
    $scope.cancelReply = function () {

        $scope.replycomment.id = '0'; 
        $scope.replycomment.text = '';   
        $scope.replycomment.date_created ='';
        $scope.replycomment.ownerid = '';
        $scope.replycomment.ownername = '';
        $scope.replycomment.ownericon = '';

    };   


});

angularApp.controller("projectPageCtrl", function ($scope, $routeParams, $location, $timeout, Project, Comment, Social) {

    //Function to Initialize the View to a ready state. 
    $scope.initialize = function () {
        
        //Initialize the UI Model
        $scope.ui = {
            description: 'less', //collapsed by default
            infopanel_state: false, //Hidden by default
            author: false //Hidden by default
        };

        //Function to toggle the Info Panel
        $scope.infopanel_toggle = function () {

            if ($scope.ui.infopanel_state == false) {

                $scope.ui.infopanel_state = true;

            } else {

                $scope.ui.infopanel_state = false;
            };

        };

        //Initialize Social UI
        $scope.uistate = {
            socialcommands: 1,
            like: 'loading',
            follow: 'loading',
            flag: 'loading'
        };

        //Initialize the Plexus Model
        $scope.plexus = {};

        //Initialize the Comments Model
        $scope.comments = [];

        //Initialize scopes for tags
        $scope.tags = [];

        //Initialize scope for current url
        $scope.url = {};

        //Initialize current url for social
        $scope.url.current = $location.absUrl();
        
        //Initialize scopes for reply
        $scope.replycomment = {
            id: '0',
            text : '',
            owner : '',
            ownername : '',
            ownericon : '',
            date_created: ''
            }; 

        //Get Objects Tags
        firebase.database().ref("projects").child($routeParams.projectId).child("tags").on("child_added", function (tagobjectdata) {

            //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
            $timeout(function () {
                $scope.tags.push({
                    id: tagobjectdata.key,
                    title: tagobjectdata.val().title
                });

            }, 0);
        });

        //Initialize Project Model
        $scope.project = {};

        //Call Factory
        Project.readextended($routeParams.projectId)

        //Factory call succeeded
        .then(function (data) {

            $scope.project = data;

            //If logged in
            if (firebase.auth().currentUser)
                {
                    //If owner
                    if ($scope.project.owner == firebase.auth().currentUser.uid)
                        {
                        $scope.ui.author = true;
                        }

                }

        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });

        //Call Comments
        Comment.readcomments("project", $routeParams.projectId)

        //Factory call succeeded
        .then(function (commentdata) {

            $scope.comments = commentdata;

            //add social plexus data to comments

            //If your logged in, then get the plexus data. (i.e. do I social this thing?)
            if (firebase.auth().currentUser) {

                angular.forEach($scope.comments, function (commentSnap) {

                    //var index = $scope.comments.map(function(e) { return e.id; }).indexOf($scope.comments);
                    var index = $scope.comments.map(function (e) {
                        return e.id;
                    }).indexOf(commentSnap.id);

                    firebase.database().ref("social_plexus").child(firebase.auth().currentUser.uid).child("comment").child(commentSnap.id).once("value", function (plexusSnapshot) {

                        //get the index of the current comment
                        var index = $scope.comments.map(function (e) {
                            return e.id;
                        }).indexOf(commentSnap.id);

                        //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
                        $timeout(function () {

                            //If there like data in the plexus...
                            if ((plexusSnapshot.val() !== null) && plexusSnapshot.val().hasOwnProperty('like')) {

                                //set the comments like status to "liked"
                                $scope.comments[index].likeStatus = "liked";

                            } else {

                                //set the comments like status to "not liked"
                                $scope.comments[index].likeStatus = "notliked";

                            };

                            //If there flag data in the plexus...
                            if ((plexusSnapshot.val() !== null) && plexusSnapshot.val().hasOwnProperty('flag')) {

                                //set the comments like status to "flagged"
                                $scope.comments[index].flagStatus = "flagged";

                            } else {

                                //set the comments flag status to "not flagged"
                                $scope.comments[index].flagStatus = "notflagged";

                            };

                        }, 0);

                    });

                })

            } else {

                angular.forEach($scope.comments, function (comments) {

                    //get the index of the current comment
                    var index = $scope.comments.map(function (e) {
                        return e.id;
                    }).indexOf(comments.id);

                    //set the comments like status to "logged out"
                    $scope.comments[index].likeStatus = "loggedout";
                    //set the comments flag status to "logged out"
                    $scope.comments[index].flagStatus = "loggedout";

                })

            };

        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });

        //Object Plexus Check

        //If you are logged in
        if (firebase.auth().currentUser) {

            //Get the current users Social Plexus of the Person they are looking at...   
            firebase.database().ref("social_plexus").child(firebase.auth().currentUser.uid).child("project").child($routeParams.projectId).on("value", function (plexusdata) {

                //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
                $timeout(function () {

                    $scope.plexus = plexusdata.val();

                    if ($scope.plexus) {

                        if ($scope.plexus.like) {
                            $scope.uistate.like = "liked"
                        } else {
                            $scope.uistate.like = "notliked"
                        }
                        if ($scope.plexus.follow) {
                            $scope.uistate.follow = "followed"
                        } else {
                            $scope.uistate.follow = "notfollowed"
                        }
                        if ($scope.plexus.flag) {
                            $scope.uistate.flag = "flagged"
                        } else {
                            $scope.uistate.flag = "notflagged"
                        }

                    } else {

                        $scope.uistate.like = "notliked";
                        $scope.uistate.follow = "notfollowed";
                        $scope.uistate.flag = "notflagged";

                    };

                }, 0);

            });

        } else //Otherwise, your not logged in, so set the buttons to logged out state. 
        {

            $scope.uistate.like = "loggedout";
            $scope.uistate.follow = "loggedout";
            $scope.uistate.flag = "loggedout";

        };

    };
    
    //Initialize the View to a ready state. 
    $scope.initialize();

    //Funtion to handle Comment Likes
    $scope.like = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments like status to "liked"
        $scope.comments[index].likeStatus = "liked";

        //Set the like in the DB
        Social.social("like", commentId, "comment", commentOwner, target, targetid);

    };

    //Function to handle Comment Unlikes
    $scope.unlike = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments like status to "notliked"
        $scope.comments[index].likeStatus = "notliked";

        //Set the like in the DB
        Social.unsocial("like", commentId, "comment", commentOwner, target, targetid);

    };

    //Funtion to handle Comment Flags
    $scope.flag = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments flag status to "flagged"
        $scope.comments[index].flagStatus = "flagged";

        //Set the flag in the DB
        Social.social("flag", commentId, "comment", commentOwner, target, targetid);

    };

    //Function to handle Comment Unflags
    $scope.unflag = function (commentId, commentOwner, target, targetid) {

        //get the index of the current comment
        var index = $scope.comments.map(function (e) {
            return e.id;
        }).indexOf(commentId);

        //set the comments flag status to "notflagged"
        $scope.comments[index].flagStatus = "notflagged";

        //Set the flag in the DB
        Social.unsocial("flag", commentId, "comment", commentOwner, target, targetid);

    };
          
    //Function to handle Reply
    $scope.reply = function (comment) {   

        $scope.replycomment.id = comment.id;
        $scope.replycomment.text = comment.text;
        $scope.replycomment.date_created = comment.date_created;
        $scope.replycomment.ownerid = comment.ownerid;
        $scope.replycomment.ownername = comment.ownername;
        $scope.replycomment.ownericon = comment.ownericon;

    };   
 
    //Function to handle Cancel Reply       
    $scope.cancelReply = function () {

        $scope.replycomment.id = '0'; 
        $scope.replycomment.text = '';   
        $scope.replycomment.date_created ='';
        $scope.replycomment.ownerid = '';
        $scope.replycomment.ownername = '';
        $scope.replycomment.ownericon = '';

    };   

});

angularApp.controller("taggedCtrl", function ($scope, $rootScope, $routeParams, $timeout) {

    //Function to Initialize the View to a ready state. 
    $scope.initialize = function () {
        
        //Initialize the Project Model (as an array)
        $scope.project_icons = [];

        //Initialize Tag
        $scope.tag = [];

        //Initialize Related tags
        $scope.relatedtags = [];

        //Get Tag Name
        firebase.database().ref("tags").child($routeParams.tagId).once("value", function(tagdata) {

            //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
            $timeout(function() {

                $scope.tag = tagdata.val()

            }, 0);

        });  

        //For each Step Index under the Project...
        firebase.database().ref("tagged_objects").child($routeParams.tagId).child("projects").on("child_added", function(tagprojkey) {

            //Get the Project from the Tagged Object list and...
            firebase.database().ref("projects").child(tagprojkey.key).once("value", function(data) {

            $timeout(function() {

                if(data.val().counts)
                    {

                        //Put the Project from Firebase into the Angualar Projects Model.     
                        $scope.project_icons.push({
                            title: data.val().title,
                            image_servingURL:data.val().image_servingURL,
                            date_created:data.val().date_created,
                            date_modified:data.val().date_modified,
                            likecount:data.val().counts.like,
                            commentcount:data.val().counts.comment,
                            id: tagprojkey.key
                        });      
                    }

                else
                    {

                        //Put the Project from Firebase into the Angualar Projects Model.     
                        $scope.project_icons.push({
                            title: data.val().title,
                            image_servingURL:data.val().image_servingURL,
                            date_created:data.val().date_created,
                            date_modified:data.val().date_modified,
                            id: tagprojkey.key
                        });  

                    }            

                //For each Tag Index under the Project...
                firebase.database().ref("projects").child(tagprojkey.key).child("tags").on("child_added", function(projtags) {

                        firebase.database().ref("tags").child(projtags.key).once("value", function(projtagdata) {

                            //if it isn't the route selected tag
                            if(projtags.key != $routeParams.tagId)
                                {

                                    //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
                                    $timeout(function() {

                                    $scope.relatedtags.push({
                                        title: projtagdata.val().title,
                                        id: projtags.key

                                    });

                                    }, 0);

                                }

                        });  

                   });        


            }, 0);            

    //        $scope.loading = false;

            });

        });

    };
    
    //Initialize the View to a ready state. 
    $scope.initialize();
     
    console.log('tagged');

});

angularApp.controller("testCtrl", function ($scope) {
    

console.log('test route')
    
});


//Info Area Controllers

angularApp.controller("contactCtrl", function ($scope) {

console.log('Contact');

});

angularApp.controller("infoCtrl", function ($scope) {

console.log('Info');

});

angularApp.controller("privacyCtrl", function ($scope) {

console.log('Privacy');

});

angularApp.controller("termsCtrl", function ($scope) {

console.log('Terms');

});


//Console Area Controllers

angularApp.controller("consoleHomeCtrl", function ($scope, News) {

    //Initialize the Persons Activity Model
    $scope.news = {};

    //Call Factory
    News.read(firebase.auth().currentUser.uid)

    //Factory call succeeded
    .then(function (data) {

        $scope.news = data;
        console.log($scope.news);
        console.log('console - home');

    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });

});

angularApp.controller("consoleProjectsCtrl", function ($scope, Project) {

    //Initialize Scope
    $scope.project_icons = [];

    //Call the Project Factory
    Project.readprojects(firebase.auth().currentUser.uid)

    //Factory call succeeded
    .then(function (data) {

        $scope.project_icons = data;

    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });

    console.log('console - projects');

});

angularApp.controller("consoleProjectCtrl", function ($scope, $routeParams, $location, Project, Asset) {

    console.log('Console - Project')

    //Initialize the UI Model
    $scope.ui = {
        description: 'less', //collapsed by default
        infopanel_state: false //Hidden by default
    };

    //Initialize Project Model
    $scope.project = {};

    //Call Factory
    Project.readextended($routeParams.projectId)

    //Factory call succeeded
    .then(function (data) {

        $scope.project = data;

    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });

    //Function to delete a asset
    $scope.deleteAsset = function (assetid) {

        Asset.delete(assetid, $routeParams.projectId)
        
        //Factory call succeeded
        .then(function (data) {

            //Re-direct the User to the console projects page 
            $location.path('/console/project/' + $routeParams.projectId);
            
            console.log('delete asset');

        })
        
        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });



    };

    //Function to delete a project
    $scope.deleteProject = function () {

        Project.delete($routeParams.projectId)
        
        //Factory call succeeded
        .then(function (data) {

            //Re-direct the User to the console projects page 
            $location.path('/console/projects/');
            
            console.log('delete project');

        })
        
        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });



    };

    //Function to toggle the Info Panel
    $scope.infopanel_toggle = function () {

        if ($scope.ui.infopanel_state == false) {

            $scope.ui.infopanel_state = true;

        } else {

            $scope.ui.infopanel_state = false;
        };

    };

});

angularApp.controller("consoleAddProjectCtrl", function ($scope, $rootScope, $location, Project) {

    //Function to Initialize the View to a ready state. 
    $scope.initialize = function () {
        
        //Initialize the Form Data Model
        $scope.form = {
            data: {},
            loading: false,
            imagechanged: false,
            mode: 'selectimage'
        };

        //Initialize the Project Model
        $scope.project = {};

        //Initialize the Image Workspace
        document.getElementById('image001').src = "/1.1.1/img/interface/buttons/button_selectimage.png";
   
        //Initialize the Progress Bar
        $rootScope.progress = 0;

        //Initialize the Tags Model
        $scope.tags = [];

        //Handle Autocomplete Filter
        $scope.loadSuggestions = function ($query) {
            var suggestedtags = $rootScope.suggests;
            return suggestedtags.filter(function (suggestedtag) {
                return suggestedtag.title.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };

    };

    //Function to advance Form from Directive isolated scope.
    $scope.imageChg = function() {
        $scope.form.imagechanged = true;
    };
        
    //Function to call the Project Factory to create a new project. 
    $scope.addproject = function () {

        //Set the form to loading mode
        $scope.form.mode = 'showprogress';

        //Call the Project Factory
        Project.create($scope.project, 'image001', 'file001', $scope.tags)

        //Project creation succeeded
        .then(function (result) {

            //Set the Global Application Status
            $rootScope.status = ""

            //Re-direct the User to the console projects page 
            $location.path('/console/projects/');

        })

        //Project creation failed
        .catch(function (error) {

            //Set the Form to Non-loading state
            $scope.form.loading = false

        });

    };

    //Initialize the View to a ready state. 
    $scope.initialize();

});

angularApp.controller("consoleEditProjectCtrl", function ($scope, $location, $timeout, $rootScope, $routeParams, Project, Image) {

    //Function to Initialize the View to a ready state. 
    $scope.initialize = function () {

        //Initialize the Form Data Model
        $scope.form = {
            data: {},
            loading: false,
            imagechanged: false,
            mode: 'enterdata'
        };

        //Initialize the Project Model
        $scope.project = {};

        //Initialize the Image Workspace
        document.getElementById('image001').src = "/1.1.1/img/interface/buttons/button_selectimage.png";

        //Initialize the Progress Bar
        $rootScope.progress = 0;

        //Initialize the Tags Model
        $scope.tags = [];

        //Handle Autocomplete Filter
        $scope.loadSuggestions = function ($query) {
            var suggestedtags = $rootScope.suggests;
            return suggestedtags.filter(function (suggestedtag) {
                return suggestedtag.title.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };

        //Function for Tag Removed
        $scope.removedTag = function (tag) {

            //check if it was added by hand
            if (tag.id) {
                //remove from object            
                firebase.database().ref("projects").child($routeParams.projectId).child("tags").orderByChild("title").equalTo(tag.title).once("value", function (tagshot) {

                    var tagexists = tagshot.exists();

                    if (tagexists) {
                        firebase.database().ref("projects").child($routeParams.projectId).child("tags").child(tag.id).remove();
                    }

                })

                //remove from tagged_object
                firebase.database().ref('tagged_objects').child(tag.id).child("projects").child($routeParams.projectId).once("value", function (objecttagshot) {

                    var objecttagexists = objecttagshot.exists();

                    if (objecttagexists) {
                        firebase.database().ref("tagged_objects").child(tag.id).child("projects").child($routeParams.projectId).remove();
                    }

                })
            }

        }

        // Function for Tag Added
        $scope.addedTag = function (tag) {

            console.log("added tag " + tag.title);
        }

        //Call Factory
        Project.read($routeParams.projectId)

        //Factory call succeeded
        .then(function (project) {

            $scope.project = project;

            //Get Objects Tags -- MOVE TO FACTORY
            firebase.database().ref("projects").child($routeParams.projectId).child("tags").on("child_added", function (tagobjectdata) {

                //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
                $timeout(function () {
                    $scope.tags.push({
                        id: tagobjectdata.key,
                        title: tagobjectdata.val().title
                    });

                }, 0);
            });


        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });

    };

    //Function to advance Form from Directive isolated scope.
    $scope.imageChg = function() {
        $scope.form.imagechanged = true;
    };    

    //Function to call the Project Factory and edit the project. 
    $scope.editproject = function () {

        //Set the form to loading mode
        $scope.form.mode = 'showprogress';

        //Call the Project Factory
        Project.update($scope.project, $scope.form.imagechanged, 'image001', 'file001', $scope.tags)

        //Project update succeeded
        .then(function (result) {

            //Set the Global Application Status
            $rootScope.status = ""

            //Re-direct the User to the console projects page 
            $location.path('/console/projects/');

        })

        //Project creation failed
        .catch(function (error) {

            //Set the Form to Non-loading state
            $scope.form.loading = false

            //Log the Error
            console.log('Edit Project Failed')
            console.log(error.message)

        });

    };

    //Initialize the View to a ready state. 
    $scope.initialize();

    console.log('console - edit project');

});

angularApp.controller("consoleAddAssetCtrl", function ($scope, $rootScope, $location, $routeParams, Asset) {

    //Function to Initialize the View to a ready state. 
    $scope.initialize = function () {

        //Initialize the Form Data Model
        $scope.form = {
            data: {},
            loading: false,
            imagechanged: false,
            mode: 'selectimage'
        };

        //Initialize the Model
        $scope.asset = {};

        //Initialize the Image Workspace
        document.getElementById('image001').src = "/1.1.1/img/interface/buttons/button_selectimage.png";

        //Initialize the Progress Bar
        $rootScope.progress = 0;

    };

    //Function to advance Form from Directive isolated scope.
    $scope.imageChg = function() {
        $scope.form.imagechanged = true;
    };
    
    //Function to call the Create function in the Factory
    $scope.addasset = function () {

        //Set the form to loading mode
        $scope.form.mode = 'showprogress';
        
        //Add Type Until Changeable from Uploader
        $scope.asset.type = "image";

        //Call the Project Factory
        Asset.create($scope.asset, $routeParams.projectId, 'image001', 'file001')

        //Project creation succeeded
        .then(function (result) {

            //Set the Global Application Status
            $rootScope.status = ""

            //Re-direct the User to the console projects page 
            $location.path('/console/project/' + $routeParams.projectId);

        })

        //Project creation failed
        .catch(function (error) {

            //Set the Form to Non-loading state
            $scope.form.loading = false

        });

    };

    //Initialize the View to a ready state. 
    $scope.initialize();

});

angularApp.controller("consoleEditAssetCtrl", function ($scope, $rootScope, $location, $routeParams, Asset, Image) {
    
    //Function to Initialize the View to a ready state. 
    $scope.initialize = function () {

        //Initialize the Form Data Model
        $scope.form = {
            data: {},
            loading: false,
            imagechanged: false,
            mode: 'enterdata'
        };

        //Initialize the Project Model
        $scope.asset = {};

        //Initialize the Image Workspace
        document.getElementById('image001').src = "/1.1.1/img/interface/buttons/button_selectimage.png";

        //Initialize the Progress Bar
        $rootScope.progress = 0;

        //Call Factory
        Asset.read($routeParams.assetId)

        //Factory call succeeded
        .then(function (asset) {

            $scope.asset = asset;

        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });

    };

    //Function to advance Form from Directive isolated scope.
    $scope.imageChg = function() {
        $scope.form.imagechanged = true;
    };
    
    //Function to call the Project Factory and edit the project. 
    $scope.editasset = function () {

        //Set the form to loading mode
        $scope.form.mode = 'showprogress';

        //Call the Project Factory
        Asset.update($scope.asset, $scope.form.imagechanged, 'image001', 'file001')

        //Project update succeeded
        .then(function (result) {

            //Set the Global Application Status
            $rootScope.status = ""

            //Re-direct the User to the console projects page 
            $location.path('/console/project/' + $routeParams.projectId)

        })

        //Project creation failed
        .catch(function (error) {

            //Set the Form to Non-loading state
            $scope.form.loading = false

            //Log the Error
            console.log('Edit Asset Failed')
            console.log(error.message)

        });

    };

    //Initialize the View to a ready state. 
    $scope.initialize();

    console.log('console - edit asset');

});

angularApp.controller("consoleFollowingCtrl", function ($scope, $timeout, Social) {

    $scope.followers = [];

    //Call Factory        
    Social.readfollowing(firebase.auth().currentUser.uid)

    //Factory call succeeded
    .then(function (data) {

        $scope.followers = data;
        
        console.log('console - following');
    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });

});

angularApp.controller("consoleFollowersCtrl", function ($scope, $timeout, Social) {

    $scope.followers = [];

    //Call Factory        
    Social.readfollowers(firebase.auth().currentUser.uid)

    //Factory call succeeded
    .then(function (data) {

        $scope.followers = data;
                
        console.log('console - followers');
    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });

});

angularApp.controller("consoleCommentsCtrl", function ($scope, Social) {
      
    //Initialize Comments
    $scope.comments = [];

    //Call Social Factory to read Actions
    Social.readaction(firebase.auth().currentUser.uid, "comment")

    //Factory call succeeded
    .then(function (data) {

        $scope.comments = data;
        console.log('console - comments');
    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });       

});

angularApp.controller("consoleFavoritesCtrl", function ($scope) {

    console.log('console - favorites');

});

angularApp.controller("consoleLikesCtrl", function ($scope, Social) {
       
    //Initialize Likes
    $scope.likes = [];
        
    //Call Social Factory to read Actions
    Social.readaction(firebase.auth().currentUser.uid, "like")

    //Factory call succeeded
    .then(function (data) {

        $scope.likes = data;
        console.log('console - likes');
    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });        

});

angularApp.controller("consoleAccountCtrl", function ($scope) {

    console.log('Console - Account Area')

});

angularApp.controller("consoleAccount_updateimageCtrl", function ($scope, $rootScope, $location, Person, Image, Auth, $timeout) {

    //Function to Initialize the View to a ready state. 
    $scope.initialize = function () {

        //Initialize the Form Data Model
        $scope.form = {
            data: {},
            loading: false,
            imagechanged: false,
            mode: 'selectimage'
        };

        //If there is no croppie active, then create an instance 
        if (!$scope.croppie) {

            //Create an instance of Croppie
            $scope.croppie = new Croppie(document.getElementById('cropworkspace'), {
                viewport: {
                    width: 500,
                    height: 500,
                    type: 'circle'
                },
                boundary: {
                    width: 600,
                    height: 600
                },
                enableExif: false,
            });

        };

        //Initialize the File Input Element
        document.getElementById("file001").value = null;

        //Initialize the Progress Bar
        $rootScope.progress = 0;

        //Initialize the Person Icon Model
        var personicon = {};

        //Get the Person Data (for images)
        Person.icon(firebase.auth().currentUser.uid)

        //Factory call succeeded
        .then(function (data) {

            $scope.personicon = data;
            
            //Initialize the Image Workspace
            document.getElementById('image001').src = $scope.personicon.image_servingURL;

        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });

    };

    //Function to advance Form from Directive isolated scope.
    $scope.imageChg = function() {
        $scope.form.imagechanged = true;
    };
    
    //Function to call the Person Factory to update the Person images (full and icon). 
    $scope.updateUserImage = function () {

        //Set the form to loading mode
        $scope.form.mode = 'showprogress';

        //Call the Project Factory
        Person.image()

        //Project creation succeeded
        .then(function (result) {

            //Set the Global Application Status
            $rootScope.status = ""

            //Re-direct the User to the console projects page 
            $location.path('/console/home/');

        })

        //Project creation failed
        .catch(function (error) {

            //Set the Form to Non-loading state
            $scope.form.loading = false

        });

    };

    //Function to process the Crop
    $scope.crop = function () {

        //Set the form to loading mode
        $scope.form.mode = 'verifycrop';

        //Get the Results of the Crop
        $scope.croppie.result({
            type: 'base64',
            size: 'original',
            format: 'png',
            quality: 1,
            circle: false
        })

        //Crop Image Successful
        .then(function (cropresult) {

            //Set the Image to the newly read file
            document.getElementById('personfull').src = cropresult;

        });


        //Get the Results of the Crop
        $scope.croppie.result({
            type: 'base64',
            size: 'original',
            format: 'png',
            quality: 1,
            circle: true
        })

        //Crop Image Successful
        .then(function (cropresult2) {

            //Set the Image to the newly read file
            document.getElementById('personicon').src = cropresult2;

        });

    };

    //Initialize the View to a ready state. 
    $scope.initialize();

    //Setup a watcher to activate croppie when the user changes the image
    $scope.$watch('form.imagechanged', function () {

        //if the directive changed the image...
        if ($scope.form.imagechanged == true) {

            //reset the image changed flag
            $scope.form.imagechanged = false;

            //update the form mode to go to the crop image state
            $scope.form.mode = 'cropimage';
            
            $scope.croppie.bind({
                url: document.getElementById('image001').src
            });
            
        };

    }, true);

});


//Person Area Controllers

angularApp.controller("personHomeCtrl", function ($scope, $timeout, $routeParams, Person, Activity) {

    //Initialize Project Model
    $scope.person = {};

    //Initialize the Persons Activity Model
    $scope.activity = {};
    
    $scope.plexus = {};
    
    //Initialize the UI Model
    $scope.ui = {
        author: false //Hidden by default
    };
    
    //Initialize Social UI
    $scope.uistate = {
        socialcommands: 1,
        like: 'loading',
        follow: 'loading',
        flag: 'loading'
    };
    
    //Call Factory
    Person.read($routeParams.personId)

    //Factory call succeeded
    .then(function (data) {

        $scope.person = data;
        
        //get number of projects
        $scope.person.projectcount = Object.keys(data.projects).length;
        console.log($scope.person.projectcount);

        Activity.read($routeParams.personId)

        //Factory call succeeded
        .then(function (data) {

            $scope.activity = data;
            
            //If you are logged in
            if (firebase.auth().currentUser) {
                
                //If owner
                if ($scope.person.id == firebase.auth().currentUser.uid)
                    {
                    $scope.ui.author = true;
                    }

                //Get the current users Social Plexus of the Person they are looking at...   
                firebase.database().ref("social_plexus").child(firebase.auth().currentUser.uid).child("person").child($routeParams.personId).on("value", function (plexusdata) {

                    //Per Angular Docs, use a timeout to apply to the scope after data is retrived. 
                    $timeout(function () {

                        $scope.plexus = plexusdata.val();
                        
                        if ($scope.plexus) {

                            if ($scope.plexus.like) {
                                $scope.uistate.like = "liked"
                            } else {
                                $scope.uistate.like = "notliked"
                            }
                            if ($scope.plexus.follow) {
                                $scope.uistate.follow = "followed"
                            } else {
                                $scope.uistate.follow = "notfollowed"
                            }
                            if ($scope.plexus.flag) {
                                $scope.uistate.flag = "flagged"
                            } else {
                                $scope.uistate.flag = "notflagged"
                            }

                        } else {

                            $scope.uistate.like = "notliked";
                            $scope.uistate.follow = "notfollowed";
                            $scope.uistate.flag = "notflagged";

                        };

                    }, 0);

                });

            } else //Otherwise, your not logged in, so set the buttons to logged out state. 
            {

                $scope.uistate.like = "loggedout";
                $scope.uistate.follow = "loggedout";
                $scope.uistate.flag = "loggedout";

            };

            console.log('person - home');

        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });

    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });

});

angularApp.controller("personProjectsCtrl", function ($scope, $routeParams, Person, Project) {

    //Initialize Project Model
    $scope.person = {};
    
    $scope.project_icons = [];

    //Call Person Factory
    Person.read($routeParams.personId)

    //Factory call succeeded
    .then(function (data) {

        $scope.person = data;
        
        //Call Project Factory
        Project.readprojects($routeParams.personId)
        
        //Factory call succeeded
        .then(function (data) {

            $scope.project_icons = data;

        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });
        

    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });

    console.log('person - projects');

});

angularApp.controller("personFollowingCtrl", function ($scope, $routeParams, $timeout, Person, Social) {

    //Initialize Person Model
    $scope.person = {};
    
    $scope.followers = [];

    //Call Factory
    Person.read($routeParams.personId)

    //Factory call succeeded
    .then(function (data) {

        $scope.person = data;
        
        Social.readfollowing($routeParams.personId)
        
        //Factory call succeeded
        .then(function (data) {

            $scope.followers = data;
            
            console.log('person - following');
        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });       


    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });

});

angularApp.controller("personFollowersCtrl", function ($scope, $routeParams, $timeout, Person, Social) {

    //Initialize Project Model
    $scope.person = {};
    
    $scope.followers = [];

    //Call Factory
    Person.read($routeParams.personId)

    //Factory call succeeded
    .then(function (data) {

        $scope.person = data;
        
        Social.readfollowers($routeParams.personId)
        
        //Factory call succeeded
        .then(function (data) {

            $scope.followers = data;
                        
            console.log('person - following');
        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        }); 

    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });

    console.log('person - followers');

});

angularApp.controller("personCommentsCtrl", function ($scope, $routeParams, Person, Social) {

    //Initialize Person Model
    $scope.person = {};
    
    //Initialize Comments
    $scope.comments = [];

    //Call Factory
    Person.read($routeParams.personId)

    //Factory call succeeded
    .then(function (data) {

        $scope.person = data;
    
        //Call Social Factory to read Actions
        Social.readaction($routeParams.personId, "comment")
        
        //Factory call succeeded
        .then(function (data) {

            $scope.comments = data;
            console.log('person - comments');
        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });       


    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });


});

angularApp.controller("personLikesCtrl", function ($scope, $routeParams, Person, Social) {

    //Initialize Person Model
    $scope.person = {};
    
    //Initialize Likes
    $scope.likes = [];

    //Call Factory
    Person.read($routeParams.personId)

    //Factory call succeeded
    .then(function (data) {

        $scope.person = data;
        
        //Call Social Factory to read Actions
        Social.readaction($routeParams.personId, "like")
        
        //Factory call succeeded
        .then(function (data) {

            $scope.likes = data;
            console.log('person - likes');
        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });       


    })

    //Factory call failed
    .catch(function (error) {

        console.log(error);

    });



});