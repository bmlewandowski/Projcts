// UTILITY FACTORIES

//Factory that manages user account functions (login, register, ect...)
angularApp.factory("Account", function ($q, Auth, User, Person, Format, Image) {

    //initialize the factory object
    var factory = {};

    //Register Function
    factory.register = function (registerdata) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Account.register - Verson 1.0 - JDN 3/27/2017
        // Factory performs all activity related to registering a new account.  
        // Factory requires the following parameters:
        //   1) registerdata : The Data Model of the user that is to be saved.   
        //-----------------------------------------------------------------------------------------//  

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Make the call to create the Account
        Auth.$createUserWithEmailAndPassword(registerdata.email.toLocaleLowerCase(), registerdata.password)

        //Account creation succeeded
        .then(function (user) {

            //Update the User Account with Custom Properties. 
            user.updateProfile({
                displayName: Format.removespaces(registerdata.displayname),
                photoURL: "/1.1.1/img/interface/user/defaultuser_avatar.png"
            })

            //Profile Update successful.
            .then(function () {

                //Call the User Factory to Create the Private User Data under the User Node in the Database.
                User.create(user)

                //Create User Success
                .then(function () {

                    //Call the Person Factory to Create the Public User Data under the Person Node in the Database.
                    Person.create(user)

                    //Create Person Success
                    .then(function () {

                        //resolve the promise and return the data
                        defer.resolve(user);

                    })

                    //Create User Failed
                    .catch(function (error) {

                        //reject the promise with an error
                        defer.reject(error);

                    });

                })

                //Create User Failed
                .catch(function (error) {

                    //reject the promise with an error
                    defer.reject(error);

                });

            })

            //Profile Update failed.
            .catch(function (error) {

                //The profile update failed so reject the promise with an error.
                defer.reject(error);

            });

        })

        //Account creation failed
        .catch(function (error) {

            //The DB read failed so reject the promise with an error.
            defer.reject(error);

        });

        //Return the Promise to the caller
        return defer.promise;

    };

    //Delete Account Function
    factory.deleteaccount = function () {

    };

    //Login Function
    factory.login = function (logindata) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Acount.login - Verson 1.0 - JDN 3/27/2017
        // Factory performs all activity related to logging in an existing user.  
        // Factory requires the following parameters:
        //   1) logindata : The login credentials of a given user.   
        //-----------------------------------------------------------------------------------------//  

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Make the call to Login
        Auth.$signInWithEmailAndPassword(logindata.email, logindata.password)

        //Login succeeded
        .then(function (user) {

            console.log('account login worked');

            //resolve the promise and return the data
            defer.resolve(user);

        })

        //Account creation failed
        .catch(function (error) {

            //The DB read failed so reject the promise with an error.
            defer.reject(error);

        });

        //Return the Promise to the caller
        return defer.promise;

    };

    //Logout Function
    factory.logout = function () {

        //------------------------------------------------------------------------------------------//
        // Factory Account.logout - Verson 1.0 - JDN 3/27/2017
        // Factory performs all activity related to logging out a currently logged in user.  
        //-----------------------------------------------------------------------------------------//  
        
        Auth.$signOut();

    };

    //Return the Factory code
    return factory;

});

//Factory that returns an AngularFire "Auth" object
angularApp.factory("Auth", function ($firebaseAuth) {
    return $firebaseAuth();
});

//Factory for Data validation
angularApp.factory("Format", function () {

    //initialize the factory object
    var factory = {};

    //Remove Addtional whitespaces. 
    factory.removespaces = function (inputstring) {

        //remove duplicate spaces
        inputstring = inputstring.replace(/\s\s+/g, ' ');

        //remove leading and trailing spaces
        inputstring = inputstring.replace(/^\s+|\s+$/g, '');

        return inputstring;

    };

    //return the factory to whatever called it so the functions inside can be used. 
    return factory;

});

//Factory for executing code before a route loads. Primary used to establish Login State.  
angularApp.factory("General", function ($q, $route, $location, Auth) {

    //initialize the factory object
    var factory = {};

    //Function to run before every route load
    factory.routeload = function () {

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Check to see if the user is authenticated
        Auth.$onAuthStateChanged(function (firebaseUser) {

            //If your not logged in, and the route is secure...
            if (!firebaseUser && $route.current.routedata.secure === true) {

                console.log('you are logged out and you should not be here.');

                //Re-direct the User to the login screen. 
                $location.path('/login/');

            }

            //Otherwise you are either logged in or the route is public...
            else {

                //resolve the promise and return the data
                defer.resolve(firebaseUser);
            }


        });

        //Return the Promise to the caller
        return defer.promise;

    };

    //Function that returns a random UUID
    factory.uuid = function () {

        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;

    };

    //Return the Factory code
    return factory;

});

//Global Varibles using the "Value" Provider.
angularApp.value("Globals", {
    loginRedirect: null,
    nextURL: null,
    modal: {
        visible: false,
        content: 'blank'
    }
});

//Factory that Manages Image Operations. 
angularApp.factory("Image", function ($q, Auth, General, $http, $rootScope, $timeout) {

    //initialize the factory object
    var factory = {};

    //Save Image
    factory.save = function (imageid, objecttype, objectid) {

        //------------------------------------------------------------------------------------------//
        // Factory Image.save - Verson 1.1 - JDN 04/01/2017
        // Image.save performs all activity related to saving an image to the database for any object. 
        // In other words, the factory acts as a "traffic contoller" that talks to various other image factories to validate, process and upload the image. 
        // It also updates the Object in the DB with the Image download information. 
        // Image.save requires the following parameters:
        //   1) imageid : The html ID of an image that you would like to upload. 
        //   2) fileid : The html ID of an image that you would like to upload. 
        //   3) objecttype : The type of Object that this image belongs to (such as a Person, Project or Asset)
        //   4) objectid : the Database Object ID of the object that the image belongs to. For example, if the objecttype is a project, then the objectid would be the projectid. 
        //-----------------------------------------------------------------------------------------//        

        //Create the Defered Promise Object
        var defer = $q.defer();

        //Authentication Check
        if (firebase.auth().currentUser) {

            //Process Image (Resample and Compress) 
            factory.process(imageid, objecttype)

            //Image processing Succeeded
            .then(function () {


                //Setup the File Name and the Image Metadata for storage
                if (objecttype == 'usericon') {

                    //Create a filename using the GUID generator and file extention
                    var filename = General.uuid() + '.png';

                    //Define the Image Metadata
                    var newMetadata = {
                        cacheControl: 'public,max-age=300',
                        contentType: 'image/png'
                    };

                } else {

                    //Create a filename using the GUID generator and file extention
                    var filename = General.uuid() + '.jpg';

                    //Define the Image Metadata
                    var newMetadata = {
                        cacheControl: 'public,max-age=300',
                        contentType: 'image/jpeg'
                    };


                };

                // Create a reference to the storage location
                var fileref = firebase.storage().ref().child(firebase.auth().currentUser.uid + '/' + filename);

                //Save the Image to Firebase Storage
                var uploadTask = fileref.putString(document.getElementById(imageid).src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64');

                //Upload Running:
                uploadTask.on('state_changed', function (snapshot) {

                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                    //Update the Application Status
                    $rootScope.$apply(function () {
                    $rootScope.progress = progress;
                    });

                    //Upload Failed
                }, function (error) {

                    // Handle unsuccessful uploads
                    console.log(error);

                    //Upload Succeeded
                }, function () {

                    // Update metadata properties
                    fileref.updateMetadata(newMetadata)

                    // Updated metadata is returned in the Promise
                    .then(function (metadata) {

                        //Get the Download URL
                        fileref.getDownloadURL()

                        //Download URL Successful
                        .then(function (downloadURL) {

                            //HTTP Post to the server
                            var data = "userid=" + firebase.auth().currentUser.uid + "&filename=" + filename

                            $http({
                                method: 'POST',
                                url: 'https://projctsdev.appspot.com/getservingurl',
                                data: data,
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                }
                            })

                            .then(function (data) {

                                var response = data.data.split('|');
                                var servingURL = response[1].replace(/(\r\n|\n|\r)/gm, "");

                                //Update the Database based on the Objecttype
                                //-------------------------------------------

                                //If the image is an Avatar Image, do the following:
                                if (objecttype == 'usericon') {

                                    //create a firebae account object
                                    var user = firebase.auth().currentUser;

                                    //Update the Account image
                                    user.updateProfile({

                                        photoURL: servingURL

                                    }).then(function () {

                                        $timeout(function () {
                                            $rootScope.firebaseUser = Auth.$getAuth();
                                            $rootScope.$apply(); //this triggers a $digest
                                        }, 0);

                                    }, function (error) {
                                        console.log(error);
                                    });

                                    //Update the Object Image File Name Under the Object Node
                                    firebase.database().ref('persons/' + objectid + '/avatar_filename/').set(filename);

                                    //Update the Object Image Serving URL under the Object Node
                                    firebase.database().ref('persons/' + objectid + '/avatar_servingURL/').set(servingURL);

                                    //Update the Object Image Download under the Object Node
                                    firebase.database().ref('persons/' + objectid + '/avatar_downloadURL/').set(downloadURL)

                                    //Update the Object Image Key under the Object Icon Node
                                    firebase.database().ref('person_icons/' + objectid + '/avatar_filename/').set(filename);

                                    //Update the Object Image Serving URL under the Object Icon Node
                                    firebase.database().ref('person_icons/' + objectid + '/avatar_servingURL/').set(servingURL);

                                    //Update the Object Image Download under the Object Icons Node
                                    firebase.database().ref('person_icons/' + objectid + '/avatar_downloadURL/').set(downloadURL);

                                    //$rootScope.firebaseUser = Auth.$getAuth();


                                    //If the image is a standard object image do this:
                                } else {

                                    //Update the Object Image File Name Under the Object Node
                                    firebase.database().ref(objecttype + 's/' + objectid + '/image_filename/').set(filename);

                                    //Update the Object Image Serving URL under the Object Node
                                    firebase.database().ref(objecttype + 's/' + objectid + '/image_servingURL/').set(servingURL);

                                    //Update the Object Image Download under the Object Node
                                    firebase.database().ref(objecttype + 's/' + objectid + '/image_downloadURL/').set(downloadURL)

                                    //Update the Object Image Key under the Object Icon Node
                                    firebase.database().ref(objecttype + '_icons/' + objectid + '/image_filename/').set(filename);

                                    //Update the Object Image Serving URL under the Object Icon Node
                                    firebase.database().ref(objecttype + '_icons/' + objectid + '/image_servingURL/').set(servingURL);

                                    //Update the Object Image Download under the Object Icons Node
                                    firebase.database().ref(objecttype + '_icons/' + objectid + '/image_downloadURL/').set(downloadURL);

                                };

                                //resolve the promise
                                defer.resolve();

                            })

                        })

                        // Getting the Download URL Failed
                        .catch(function (error) {

                            //reject the error
                            defer.reject(error);

                        });

                        //Updating the Metadata Failed    
                    }).catch(function (error) {

                        //reject the error
                        defer.reject(error);

                    });

                });

            })

            //Image Downsample Failed
            .catch(function (error) {

                //Log the Error
                console.log(error);

            });

        } else { //authentication failed

            //Log the Error
            console.log('authorization failure');

        }

        //Return the Promise to the caller
        return defer.promise;

    };

    //Process Image
    factory.process = function (imageid, objecttype) {

        //------------------------------------------------------------------------------------------//
        // Factory Image.process - Verson 1.0 - JDN 4/01/2017
        // Image.process Resize large images down to smaller images Using the Hermite Algorithm
        // Image.process Also converts the image into jpeg format and recompresses. 
        // Image.process requires the following parameters:
        //   1) imageid : The html ID of an image that you would like to process. 
        //   2) objecttype : the type of object you are saving (used to determine if you are processing an account icon)
        //-----------------------------------------------------------------------------------------//        

        //Create the Defered Promise Object
        var defer = $q.defer();

        //Define the Image
        var image = document.getElementById(imageid);

        //Create the in Memory Canvas
        var canvas = document.createElement('canvas');

        //Create The Context to the In-Memory Canvas
        var ctx = canvas.getContext("2d");

        //Adjust the Canvas to the size of the image
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        //console.log(image.naturalHeight);
        //console.log(canvas.height);

        //Draw the Image onto the Canvas
        ctx.drawImage(image, 0, 0);

        //Setup Height and Width Data for the Resampler
        if (objecttype == "usericon") {
            var height = 128;
        } else {
            if (image.naturalHeight <= 1024) {
                var height = image.naturalHeight;
            } else {
                var height = 1024;
            };
        };

        var width = (image.width / image.height) * height;;
        var width_source = canvas.width;
        var height_source = canvas.height;
        width = Math.round(width);
        height = Math.round(height);

        //Setup the Image Data for the Resampler
        var img = ctx.getImageData(0, 0, width_source, height_source);
        var img2 = ctx.createImageData(width, height);
        var data = img.data;
        var data2 = img2.data;

        //Function to Resample the Image on the Canvas using the Hermite Algorithm
        function resampler(_callback) {

            //Setup the Ratio Data for the resampler
            var ratio_w = width_source / width;
            var ratio_h = height_source / height;
            var ratio_w_half = Math.ceil(ratio_w / 2);
            var ratio_h_half = Math.ceil(ratio_h / 2);

            //Run the resample loop
            for (var j = 0; j < height; j++) {
                for (var i = 0; i < width; i++) {
                    var x2 = (i + j * width) * 4;
                    var weight = 0;
                    var weights = 0;
                    var weights_alpha = 0;
                    var gx_r = 0;
                    var gx_g = 0;
                    var gx_b = 0;
                    var gx_a = 0;
                    var center_y = j * ratio_h;

                    var xx_start = Math.floor(i * ratio_w);
                    var xx_stop = Math.ceil((i + 1) * ratio_w);
                    var yy_start = Math.floor(j * ratio_h);
                    var yy_stop = Math.ceil((j + 1) * ratio_h);
                    xx_stop = Math.min(xx_stop, width_source);
                    yy_stop = Math.min(yy_stop, height_source);

                    for (var yy = yy_start; yy < yy_stop; yy++) {
                        var dy = Math.abs(center_y - yy) / ratio_h_half;
                        var center_x = i * ratio_w;
                        var w0 = dy * dy; //pre-calc part of w
                        for (var xx = xx_start; xx < xx_stop; xx++) {
                            var dx = Math.abs(center_x - xx) / ratio_w_half;
                            var w = Math.sqrt(w0 + dx * dx);
                            if (w >= 1) {
                                //pixel too far
                                continue;
                            }
                            //hermite filter
                            weight = 2 * w * w * w - 3 * w * w + 1;
                            var pos_x = 4 * (xx + yy * width_source);
                            //alpha
                            gx_a += weight * data[pos_x + 3];
                            weights_alpha += weight;
                            //colors
                            if (data[pos_x + 3] < 255)
                                weight = weight * data[pos_x + 3] / 250;
                            gx_r += weight * data[pos_x];
                            gx_g += weight * data[pos_x + 1];
                            gx_b += weight * data[pos_x + 2];
                            weights += weight;
                        }
                    }
                    data2[x2] = gx_r / weights;
                    data2[x2 + 1] = gx_g / weights;
                    data2[x2 + 2] = gx_b / weights;
                    data2[x2 + 3] = gx_a / weights_alpha;
                }

            };

            _callback();

        };

        //Call the Resampler function
        resampler(function () {

            //Resize the Canvas
            canvas.width = width;
            canvas.height = height;

            //draw the resampled image back to the canvas.
            ctx.putImageData(img2, 0, 0);

            // save canvas image as data url (png for account icons, jpg for everything else)
            if (objecttype == "usericon") {
                dataURL = canvas.toDataURL("image/png");
            } else {
                dataURL = canvas.toDataURL("image/jpeg", 0.6);
            };

            //Draw canvas image back to HTML image element
            image.src = dataURL;

            //resolve the promise
            defer.resolve();

        });


        //Return the Promise to the caller
        return defer.promise;

    };

    //Validate the Image Resolution and Aspect Ratio 
    factory.validate = function (img) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Image.validate - Verson 1.0 - JDN 4/01/2017
        // Image.validate checks that the selected image is within correct parameters.
        // Image.process requires the following parameters:
        //   1) img : The image to be validated. 
        //-----------------------------------------------------------------------------------------//   

        //Create the Defered Promise Object
        var defer = $q.defer();

        //Set Initial Image Status 
        var image_status = "good";
        var image_error = "";

        //Check Height and Width
        if (img.naturalWidth < 480) {
            image_status = "bad";
            image_error = "error_minwidth";
        };

        //Check Minimum Height
        if (img.naturalHeight < 480) {
            image_status = "bad";
            image_error = "error_minheight";
        };

        //Check for Aspect Ratio for extreme images
        //-----------------------------------------
        //Aspect Ratio Logic is as follows:
        //Landscape Upper Limit is 480*5 = 2400 ----- w=2400 h=480 Aspect Ratio is w/h or 5.0 for landscape. 
        //Landscape upper Limit must be under 5.0
        //Portrait Upper Limit is same logic, but h=480, w=2400. So w/h is 0.2 
        //Portrait Upper Limit must be greater than 0.2
        if (img.naturalWidth / img.naturalHeight < 0.2) {
            image_status = "bad";
            image_error = "error_portraitratio";
        };

        if (img.naturalWidth / img.naturalHeight > 5) {
            image_status = "bad";
            image_error = "error_landscaperatio";
        };

        //Return the results of the image validation
        if (image_status == "good") {

            //resolve the promise successfully. 
            defer.resolve();

        } else {

            //Resolve the Promise with an error
            defer.reject(image_error);

        }

        //Return the Promise to the caller
        return defer.promise;

    };
    
    //Check Image Orientation
    factory.orientation = function (img) {

        //------------------------------------------------------------------------------------------//
        // Factory Image.orientation - Verson 1.0 - BML 5/07/2017
        // Image.orienation checks the EXIF tag for orientation and rotates accordingly.
        // Image.process requires the following parameters:
        //   1) img : The image to be evalated. 
        //-----------------------------------------------------------------------------------------// 

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Apply rotation based on orientation
        function applyTransform(ctx, orientation, width, height) {
            switch (orientation) {
                
                //Method 1
//              case 2:
//                return ctx.transform(-1, 0, 0, 1, width, 0);
//              case 3:
//                return ctx.transform(-1, 0, 0, -1, width, height);
//              case 4:
//                return ctx.transform(1, 0, 0, -1, 0, height);
//              case 5:
//                return ctx.transform(0, 1, 1, 0, 0, 0);
//              case 6:
//                return ctx.transform(0, 1, -1, 0, height, 0);
//              case 7:
//                return ctx.transform(0, -1, -1, 0, height, width);
//              case 8: // 90° rotate left
//                return ctx.transform(0, -1, 1, 0, 0, width);
                    
                //Method 2
              case 2:
                // horizontal flip
                ctx.translate(width, 0)
                ctx.scale(-1, 1)
                break
              case 3:
                // 180° rotate left
                ctx.translate(width, height)
                ctx.rotate(Math.PI)
                break
              case 4:
                // vertical flip
                ctx.translate(0, height)
                ctx.scale(1, -1)
                break
              case 5:
                // vertical flip + 90 rotate right
                ctx.rotate(0.5 * Math.PI)
                ctx.scale(1, -1)
                break
              case 6:
                // 90° rotate right
                ctx.rotate(0.5 * Math.PI)
                ctx.translate(0, -height)
                break
              case 7:
                // horizontal flip + 90 rotate right
                ctx.rotate(0.5 * Math.PI)
                ctx.translate(width, -height)
                ctx.scale(-1, 1)
                break
              case 8:
                // 90° rotate left
                ctx.rotate(-0.5 * Math.PI)
                ctx.translate(-width, 0)
                break
            }
        }
        
        //Check EXIF Tags and rotate image
        EXIF.getData(img, function() {

            var orientation = EXIF.getTag(this, "Orientation");
            console.log(orientation);
            
            //Trying to debug the repeating orientation
            if (EXIF.getTag(this, "Orientation") == undefined)
                {
                    console.log('undefined')
                }
                     
            //Define the Image
            var image = img;
            
            //Create the in Memory Canvas
            var canvas = document.createElement('canvas');

            //Create The Context to the In-Memory Canvas
            var ctx = canvas.getContext("2d");

            //Adjust the Canvas to the size of the image
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            
            //Draw the Image onto the Canvas
            applyTransform(ctx, orientation, image.naturalWidth, image.naturalHeight)

            ctx.drawImage(image, 0, 0);
            
            //set image to rotated canvas
            img.src = canvas.toDataURL();
            
            return defer.resolve(orientation);

            }); 
        
        
            //Return the Promise to the caller
            return defer.promise;
        

    return factory;


    };
    
    //Delete Image
    factory.delete = function (id) {

        //------------------------------------------------------------------------------------------//
        // Factory Image.delete - Verson 1.0 - BML 5/07/2017
        // Image.delete removes the selected image from storage.
        // Image.process requires the following parameters:
        //   1) id : The file name of the image to be removed. 
        //-----------------------------------------------------------------------------------------// 
        
        //Authentication Check
        if (firebase.auth().currentUser) {

            //Create the Defered Promise Object
            var defer = $q.defer()

            // Create a reference to the storage location
            var imageRef = firebase.storage().ref().child(firebase.auth().currentUser.uid + '/' + id);

            //Delete the Image to Firebase Storage
            imageRef.delete()

            .then(function (data) {

                defer.resolve(data)

            })

            // Deleting the file failed
            .catch(function (error) {

                //reject the error
                defer.reject(error)

            });


            //Return the Promise to the caller
            return defer.promise;

        } else { //authentication failed

            console.log('authorization failure');

        }

    };

    return factory;

});

//Factory that manages the modal operations
angularApp.factory("Modal", function (Globals) {

    //initialize the factory object
    var factory = {};

    //Load Modal Function
    factory.load = function (content) {
        Globals.modal.content = content;
        Globals.modal.visible = true;
    };

    //Unload Modal Function
    factory.unload = function () {
        Globals.modal.visible = false;
        Globals.modal.content = 'blank';
    };

    //return the factory to whatever called it so the functions inside can be used. 
    return factory;
});

//Factory that returns a reference object of the FireBase Database
angularApp.factory("Preload", function ($route, $templateRequest) {

    //initialize the factory object
    var factory = {};

    //Loop through the routes and for each route:
    angular.forEach($route.routes, function (value, key) {

        //If the route template exists:
        if (value.templateUrl) {

            //preload the routetemplate
            $templateRequest(value.templateUrl);

        };

    });

    //Preload Images
    var img = new Image();
    img.src = '/img/backgrounds/001.jpg';

    //return the factory to whatever called it so the functions inside can be used. 
    return factory;

});

//Factory for Data validation
angularApp.factory("Validate", function ($q) {

    //initialize the factory object
    var factory = {};

    //Check if Display Name is Open - Returns display name if taken, or null if open 
    factory.displaynameOpen = function (displayname) {

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Call to the Database 
        firebase.database().ref("persons").orderByChild("displaynamelower").equalTo(displayname.toLocaleLowerCase()).once('value')

        //Promise resovled with data:
        .then(function (snapshot) {

            console.log(snapshot.val());

            //resolve the promise and return the data
            defer.resolve(snapshot.val());

            //Promise Failed:    
        }, function (error) {

            //The DB read failed so reject the promise with an error.
            defer.reject(error);

        });

        //Return the Promise to the caller
        return defer.promise;

    };

    //Check if Email is Open - Returns Email Address if taken, or null if open 
    factory.emailOpen = function (email) {

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Call to the Firebase Account System to see if the email is open 
        firebase.auth().fetchProvidersForEmail(email)

        //Promise resovled with data:
        .then(function (snapshot) {

            defer.resolve(snapshot[0]);

            //Promise Failed:    
        }, function (error) {

            //The DB read failed so reject the promise with an error.
            defer.reject(error);

        });

        //Return the Promise to the caller
        return defer.promise;

    };

    //return the factory to whatever called it so the functions inside can be used. 
    return factory;

});

// ENTITY FACTORIES

//Factory that manages Asset Records in the Firebase
angularApp.factory("Asset", function ($q, $timeout, Image, $rootScope, Activity) {

    //initialize the factory object
    var factory = {};

    //Create Function
    factory.create = function (asset, projectid, imageid, fileid) {

        //------------------------------------------------------------------------------------------//
        // Factory Asset.create - Verson 1.0 - JDN 3/27/2017
        // Factory performs all activity related to saving an new asset to the database.  
        // Factory requires the following parameters:
        //   1) asset : The Data Model of the Project that is to be saved.  
        //   2) image : The id of the HTML Image Tag of the Image that is to be used as the Project Image.
        //   3) projectid : The id of the Project that the Assest belongs to. 
        //   4) file : The ID of the HTML File input box that contains the orginal image file chosen by the user.  
        //-----------------------------------------------------------------------------------------//  

        //Authentication Check
        if (firebase.auth().currentUser) {

            //Create the Defered Promise Object
            var defer = $q.defer();

            //Update the Application Status
            $rootScope.status = "Adding your Step!"

            //Create the new Reference for the Project
            var newRef = firebase.database().ref('assets/').push();

            //Add Asset Attributes to the Asset model
            asset.id = newRef.key;
            asset.owner = firebase.auth().currentUser.uid;
            asset.parent = projectid;
            asset.date_created = firebase.database.ServerValue.TIMESTAMP;
            asset.date_modified = firebase.database.ServerValue.TIMESTAMP;
            asset.type = 'image';
            
            //Create the asset data under the Assets node       
            newRef.set(asset)

            //Firebase call success
            .then(function () {

                //Create Asset ID under Project
                firebase.database().ref('projects/' + projectid + '/assets/' + asset.id).set({
                    id: asset.id,
                    date_created: firebase.database.ServerValue.TIMESTAMP
                })

                //Asset data added under the Project Node, so go to the next step. 
                .then(function () {
                    
                    //Handle null description
                    if (asset.description == null) {
                        asset.description = ""
                    }

                    //Save Asset Icon to database
                    firebase.database().ref('asset_icons/' + asset.id).set({
                        id: newRef.key,
                        owner: firebase.auth().currentUser.uid,
                        parent: projectid,
                        date_created: firebase.database.ServerValue.TIMESTAMP,
                        date_modified: firebase.database.ServerValue.TIMESTAMP,
                        title: asset.title,
                        description: asset.description

                    })

                    //Asset Icon added under the the Asset Icon Node, so go to the next step. 
                    .then(function () {

                        //Set the Activity                                          
                        Activity.create("create", newRef.key, "asset")

                        //Activity Added to the Database, so go on to the next step.     
                        .then(function () {

                            //Call the Image Factory to save the object
                            Image.save(imageid, 'asset', asset.id)

                            //Image Upload completed
                            .then(function () {

                                //Send tags to tag factory
                                //Tag.create(newRef.key, "project", tags)

                                //resolve the promise
                                defer.resolve();

                            });

                        });

                    });

                });

            });

            //Return the Promise to the caller
            return defer.promise;

        } else { //authentication failed

            console.log('authorization failure');

        }

    };

    //Read Asset Function
    factory.read = function (id) {

        //------------------------------------------------------------------------------------------//
        // Factory Asset.read - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to reading an existing asset in the database.  
        // Factory requires the following parameters:
        //   1) id : The ID of the asset to be read. 
        //-----------------------------------------------------------------------------------------//  
        
        //Create the Defered Promise Object
        var defer = $q.defer()

        //Get the asset data using the asset ID
        firebase.database().ref('assets/' + id).once("value")

        //Firebase call success
        .then(function (assetsnapshot) {

            var asset = assetsnapshot.val();

            //Get the Owner Info of the asset
            firebase.database().ref("persons").child(assetsnapshot.val().owner).once("value")

            //Firebase call success
            .then(function (ownersnapshot) {

                //Add the Owner data to the Asset
                asset.ownername = ownersnapshot.val().displayname;
                asset.ownerimageurl = ownersnapshot.val().imageurl;
                asset.ownericonurl = ownersnapshot.val().iconurl;

                //resolve the promise and return the data
                defer.resolve(asset);

            })

            // Getting the Owner Failed
            .catch(function (error) {

                //reject the error
                defer.reject(error);

            });

        })

        // Getting the Asset Failed
        .catch(function (error) {

            //reject the error
            defer.reject(error);

        });


        //Return the Promise to the caller
        return defer.promise;


        console.log('read asset');

    };

    //Read Project Assets
    factory.readassets = function (id) {

        //------------------------------------------------------------------------------------------//
        // Factory Asset.readassets - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to reading assets of existing project in the database.  
        // Factory requires the following parameters:
        //   1) id : The ID of the projects to have assets read from. 
        //-----------------------------------------------------------------------------------------// 
        
        //Create the Defered Promise Object
        var defer = $q.defer()

        var assetlist = [];

        //Check if Assets exist
        firebase.database().ref("projects/" + id).once('value', function (projectsnapshot) {

            //Project has Assets
            if (projectsnapshot.hasChild("assets")) {

                firebase.database().ref("asset_icons").orderByChild("parent").equalTo(id).on("child_added", function (assetsnapshot) {
                    
                    //assetsnapshot.url = assetsnapshot.val().image_servingURL
                    //console.log(assetsnapshot.url)                
                    assetlist.push(assetsnapshot.val());

                    defer.resolve(assetlist);

                });

            }

            //Project does not have assets
            else {

                defer.resolve(assetlist);
            }

        });

        //Return the Promise to the caller
        return defer.promise;

    };

    //Read Project Assets plus owner and plexus
    factory.readassetsextended = function (projectid, assetid) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Asset.readassetsextended - Verson 1.0 - BML 5/17/2017
        // Factory performs all activity related to reading assets of existing project in the database.  
        // Factory requires the following parameters:
        //   1) projectid : The ID of the project to have assets read from. 
        //   2) assetid : The ID of the asset referred from. 
        //-----------------------------------------------------------------------------------------// 

        //Create the Defered Promise Object
        var defer = $q.defer()

        var assetlist = [];

        //Check if Assets exist
        firebase.database().ref("projects/" + projectid).once('value', function (projectsnapshot) {

            //Project has Assets
            if (projectsnapshot.hasChild("assets")) {

                firebase.database().ref("assets").orderByChild("parent").equalTo(projectid).on("child_added", function (assetsnapshot) {

                    var asset = assetsnapshot.val();

                    firebase.database().ref("persons").child(assetsnapshot.val().owner).on("value", function (ownersnapshot) {

                        //Add the Owner data to the Asset
                        asset.ownername = ownersnapshot.val().displayname;
                        asset.ownerimageurl = ownersnapshot.val().imageurl;
                        asset.ownericonurl = ownersnapshot.val().iconurl;

                        assetlist.push(asset);
                        defer.resolve(assetlist);

                    });

                });

            }

            //Project does not have assets
            else {
 
                defer.resolve(assetlist);
            }

        });

        //Return the Promise to the caller
        return defer.promise;

    };

    //Update Asset Function
    factory.update = function (asset, imagechanged, imageid, fileid) {

        //------------------------------------------------------------------------------------------//
        // Factory Asset.update - Verson 1.0 - BML 4/16/2017
        // Factory performs all activity related to updating an existing asset in the database.  
        // Factory requires the following parameters:
        //   1) asset : The Data Model of the Asset that is to be saved. 
        //   2) imagechanged: Flag for if a new Image has been selected
        //   3) image : The id of the HTML Image Tag of the Image that is to be used as the Project Image. 
        //   4) file : The ID of the HTML File input box that contains the orginal image file chosen by the user.
        //   5) tags : The Tags from the updated Project
        //-----------------------------------------------------------------------------------------//  
        
        //Authentication Check
        if (firebase.auth().currentUser) {

            //Create the Defered Promise Object
            var defer = $q.defer()
            
            //Update the Application Status
            $rootScope.status = "Editing Your Asset"

            //Handle null description
            if (asset.description == null) {
                asset.description = ""
            }

            //Add Asset Attributes to the asset model
            asset.date_modified = firebase.database.ServerValue.TIMESTAMP;
            asset.ownername = null;
            asset.ownerimageurl = null;
            asset.ownericonurl = null;
            var deletefileid = asset.image_filename;

            //Update Asset
            firebase.database().ref('assets/' + asset.id).update(asset)

            //Firebase call success
            .then(function () {


            })

            // Getting the Asset Create Failed
            .catch(function (error) {

                //reject the error
                defer.reject(error);

            });


            //Update Asset Icon
            firebase.database().ref('asset_icons/' + asset.id).update({
                title: asset.title,
                description: asset.description,
                date_modified: asset.date_modified
            })

            //Set the Activity
            Activity.create("edit", asset.id, "asset")

            //If Image has changed
            if (imagechanged == true) {

                //Delete Existing Image
                Image.delete(deletefileid)

                .then(function (result) {

                    //Call the Image Factory to save the object
                    Image.save(imageid, 'asset', asset.id)

                    //Factory call succeeded
                    .then(function (data) {

                        //resolve the promise and return the data
                        defer.resolve(asset);

                    })

                    //Factory call failed
                    .catch(function (error) {

                        console.log(error);

                        //reject the error
                        defer.reject(error);

                    });

                })

                .catch(function (error) {

                    //Log the Error
                    console.log('Delete Image Failed')
                    console.log(error.message)

                })

            } else {

                //resolve the promise and return the data
                defer.resolve(asset);

            }

            //Return the Promise to the caller
            return defer.promise;

            console.log('update asset');

        } else { //authentication failed

            console.log('authorization failure');

        }

    };

    //Delete Asset Function
    factory.delete = function (assetid, projectid) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Asset.delete - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to deleting an existing asset from the database.  
        // Factory requires the following parameters:
        //   1) assetid : The ID of the asset to be deleted. 
        //   1) projectid : The ID of the project to have the asset removed from.
        //-----------------------------------------------------------------------------------------// 

        //Authentication Check
        if (firebase.auth().currentUser) {

            //Create the Defered Promise Object
            var defer = $q.defer()
            var fileid

            //get imagekey
            firebase.database().ref('assets/' + assetid + '/image_filename').once("value", function (snapshot) {

                fileid = snapshot.val()

            })

            //Imagekey Success
            .then(function () {

                //Delete the image from storage
                Image.delete(fileid)

                //delete asset
                firebase.database().ref('assets/' + assetid).remove()

                //delete asset icon
                firebase.database().ref('asset_icons/' + assetid).remove()
                  
                //delete asset reference in project if project exists
                firebase.database().ref('projects/' + projectid).once("value", function (project) {

                    var projectexists = project.exists();

                    if (projectexists) {
                        console.log("project exists")
                        firebase.database().ref('projects/' + projectid + '/assets/' + assetid).remove();
                    } 

                })

                //delete asset social if exists
                firebase.database().ref('asset_social').child(assetid).once("value", function (assetsocial) {

                    var assetsocialexists = assetsocial.exists();

                    if (assetsocialexists) {
                        firebase.database().ref('asset_social').child(assetid).remove();
                    } 

                })
                
                //delete asset comments if exists
                firebase.database().ref('comments').child('assets').child(assetid).once("value", function (assetcomments) {

                    var assetcommentsexists = assetcomments.exists();

                    if (assetcommentsexists) {
                        firebase.database().ref('comments').child('assets').child(assetid).remove();
                    } 

                })

                //resolve the promise and return the data
                defer.resolve(fileid)
                
            })

            //Imagekey Failed
            .catch(function (error) {

                //reject the promise with an error
                defer.reject(error);

            });

            //Return the Promise to the caller
            return defer.promise;

            console.log('delete asset');

        } else { //authentication failed

            console.log('authorization failure');

        }

    };

    //Return the Factory code
    return factory;

});

//Factory that manages Folder Records in the Firebase
angularApp.factory("Folder", function () {

    //initialize the factory object
    var factory = {};

    //Create Folder Function
    factory.create = function () {

        console.log('create folder');

    };

    //Read Folder Function
    factory.read = function () {

        console.log('read folder');

    };

    //Update Folder Function
    factory.update = function () {

        console.log('update folder');

    };

    //Delete Folder Function
    factory.delete = function () {

        console.log('delete folder');

    };

    //Return the Factory code
    return factory;

});

//Factory that manages Person Records in the Firebase
angularApp.factory("Person", function ($q, $rootScope, Image) {

    //initialize the factory object
    var factory = {};

    //Create Person Function
    factory.create = function (user) {

        //------------------------------------------------------------------------------------------//
        // Factory Person.create - Verson 1.0 - JDN 3/27/2017
        // Factory performs all activity related to saving an new Person to the database.  
        // Factory requires the following parameters:
        //   1) user : The Data Model of the Project that is to be saved.   
        //-----------------------------------------------------------------------------------------//  

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Create the Peson data under the Pesons node
        firebase.database().ref('persons/' + user.uid).set({
            displayname: user.displayName,
            displaynamelower: user.displayName.toLocaleLowerCase(),
            image_downloadURL: '/1.1.1/img/interface/user/defaultuser_full.png',
            image_filename: 'defaultuser_full.png',
            image_servingURL: '/1.1.1/img/interface/user/defaultuser_full.png',
            avatar_downloadURL: '/1.1.1/img/interface/user/defaultuser_avatar.png',
            avatar_filename: 'defaultuser_avatar.png',
            avatar_servingURL: '/1.1.1/img/interface/user/defaultuser_avatar.png',
            date_created: firebase.database.ServerValue.TIMESTAMP,
            date_modified: firebase.database.ServerValue.TIMESTAMP,
            admin: 'false'
        })

        //Create Peson Success
        .then(function () {

            //Create the Peson Icon data under the person_icons node
            firebase.database().ref('person_icons/' + user.uid).set({
                displayname: user.displayName,
                image_downloadURL: '/1.1.1/img/interface/user/defaultuser_full.png',
                image_filename: 'defaultuser_full.png',
                image_servingURL: '/1.1.1/img/interface/user/defaultuser_full.png',
                avatar_downloadURL: '/1.1.1/img/interface/user/defaultuser_avatar.png',
                avatar_filename: 'defaultuser_avatar.png',
                avatar_servingURL: '/1.1.1/img/interface/user/defaultuser_avatar.png',
                date_created: firebase.database.ServerValue.TIMESTAMP,
                date_modified: firebase.database.ServerValue.TIMESTAMP,
                admin: 'false'
            })

            //Create Peson Icon Success
            .then(function () {

                //resolve the promise and return the data
                defer.resolve(user);

            })

            //Create Person Icon Failed
            .catch(function (error) {

                //reject the promise with an error
                defer.reject(error);

            });

        })

        //Create Peson Failed
        .catch(function (error) {

            //reject the promise with an error
            defer.reject(error);

        });

        //Return the Promise to the caller
        return defer.promise;

        console.log('create person');

    };

    //Read Person Function
    factory.read = function (id) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Person.read - Verson 1.0 - JDN 3/27/2017
        // Factory performs all activity related to reading an existing Person from the database.  
        // Factory requires the following parameters:
        //   1) id : The id of the person to be read.   
        //-----------------------------------------------------------------------------------------//  

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Get the person data using the person ID
        firebase.database().ref('persons/' + id).once("value")

        //Firebase call success
        .then(function (personsnapshot) {

            var person = personsnapshot.val();

            //set key as id for page navigation
            person.id = personsnapshot.key;

            //resolve the promise and return the data
            defer.resolve(person);

            console.log('read person');

        })

        //Firebase call failed
        .catch(function (error) {

            //reject the promise with an error
            defer.reject(error);

            console.log(error);

        });

        //Return the Promise to the caller
        return defer.promise;

    };

    //Update Person Function
    factory.update = function () {

        console.log('update person');

    };

    //Read Person Icon Function
    factory.icon = function (id) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Person.icon - Verson 1.0 - JDN 3/27/2017
        // Factory performs all activity related to reading the icon of a Person in the database.  
        // Factory requires the following parameters:
        //   1) id : The id of the person to read icon for.   
        //-----------------------------------------------------------------------------------------//  

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Get the person data using the person ID
        firebase.database().ref('person_icons/' + id).once("value")

        //Firebase call success
        .then(function (personsnapshot) {

            var icon = personsnapshot.val();

            //set key as id for page navigation
            icon.id = personsnapshot.key;

            //resolve the promise and return the data
            defer.resolve(icon);

            console.log('read person icon');

        })

        //Firebase call failed
        .catch(function (error) {

            //reject the promise with an error
            defer.reject(error);

            console.log(error);

        });

        //Return the Promise to the caller
        return defer.promise;

    };
    
    //Update Person Image
    factory.image = function () {

        //------------------------------------------------------------------------------------------//
        // Factory Person.image - Verson 1.1 - JDN 04/01/2017
        // Person.image performs all activity related to saving an image to the database for a person. 
        // Also updates the Account Avatar and deletes the old user images (if any).
        // Image.save requires no parameters
        //-----------------------------------------------------------------------------------------//  

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Initialize the Person Icon Model
        var personicon = {};

        //Get the Person Data (for images)
        factory.icon(firebase.auth().currentUser.uid)

        //Factory call succeeded
        .then(function (data) {

            personicon = data;

            console.log(personicon);

        })

        //Factory call failed
        .catch(function (error) {

            console.log(error);

        });

        //Update the Application Status
        $rootScope.status = "Saving Your Picture"

        //Call the Image Factory to save the New Full Image
        Image.save('personfull', 'person', firebase.auth().currentUser.uid)

        //Image Upload completed
        .then(function () {

            //Update the Application Status
            $rootScope.status = "Saving Your Icon"

            //Call the Image Factory to save the New Avatar Image
            Image.save('personicon', 'usericon', firebase.auth().currentUser.uid)

            //Image Upload completed
            .then(function () {

                //Delete the old full user image
                Image.delete(personicon.image_filename);

                //Delete the old user Avatar
                Image.delete(personicon.avatar_filename);

                //resolve the promise and return the data
                defer.resolve();

            });

        });

        //Return the Promise to the caller
        return defer.promise;

    };

    //Return the Factory code
    return factory;

});

//Factory that manages Project Records in the Firebase
angularApp.factory("Project", function ($rootScope, $q, $timeout, Image, Asset, Tag, Activity) {

    //initialize the factory object
    var factory = {};

    //Create Function
    factory.create = function (project, imageid, fileid, tags) {

        //------------------------------------------------------------------------------------------//
        // Factory Project.create - Verson 1.1 - BML 5/08/2017
        // Factory performs all activity related to saving a new project to the database.  
        // Factory requires the following parameters:
        //   1) project : The Data Model of the Project that is to be saved.  
        //   2) image : The id of the HTML Image Tag of the Image that is to be used as the Project Image. 
        //   3) file : The ID of the HTML File input box that contains the orginal image file chosen by the user.  
        //   4) tags : The Tags from the updated Project
        //-----------------------------------------------------------------------------------------//  

        //Authentication Check
        if (firebase.auth().currentUser) {

            //Create the Defered Promise Object
            var defer = $q.defer();

            //Update the Application Status
            $rootScope.status = "Creating Your Project"

            //Create the new Reference for the Project
            var newRef = firebase.database().ref('projects/').push();

            //Add Project Attributes to the project model
            project.id = newRef.key;
            project.owner = firebase.auth().currentUser.uid;
            project.parent = firebase.auth().currentUser.uid;
            project.date_created = firebase.database.ServerValue.TIMESTAMP;
            project.date_modified = firebase.database.ServerValue.TIMESTAMP;
            project.private = 'false';
            project.hide = 'false';

            //Create the project data under the project node       
            newRef.set(project)

            //Firebase call success
            .then(function () {

                //Create Project ID under User
                firebase.database().ref('persons/' + firebase.auth().currentUser.uid + '/projects/' + project.id).set({
                    id: project.id,
                    owner: project.owner,
                    date_created: firebase.database.ServerValue.TIMESTAMP
                })

                //Project data added under the User Node, so go to the next step. 
                .then(function () {
                    
                    //Handle null description
                    if (project.description == null) {
                        project.description = ""
                    }

                    //Save Project icon to database
                    firebase.database().ref('project_icons/' + project.id).set({
                        id: newRef.key,
                        owner: firebase.auth().currentUser.uid,
                        parent: firebase.auth().currentUser.uid,
                        date_created: firebase.database.ServerValue.TIMESTAMP,
                        date_modified: firebase.database.ServerValue.TIMESTAMP,
                        title: project.title,
                        description: project.description,
                        private: 'false',
                        hide: 'false'
                    })

                    //Project Icon added under the the Project Icon Node, so go to the next step. 
                    .then(function () {

                        //Set the Activity
                        Activity.create("create", newRef.key, "project")

                        //Activity Added to the Database, so go on to the next step.     
                        .then(function () {

                            //Call the Image Factory to save the object
                            Image.save(imageid, 'project', project.id)

                            //Image Upload completed
                            .then(function () {

                                //Send tags to tag factory
                                Tag.create(newRef.key, "project", tags)

                                //resolve the promise and return the data
                                defer.resolve(project);

                            });

                        });

                    });

                });

            });

            //Return the Promise to the caller
            return defer.promise;

        } else { //authentication failed

            console.log('authorization failure');

        }

    };

    //Read Project Function
    factory.read = function (id) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Project.read - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to reading existing project in the database.  
        // Factory requires the following parameters:
        //   1) id : The ID of the project to read. 
        //-----------------------------------------------------------------------------------------// 

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Get the project data using the project ID
        firebase.database().ref('projects/' + id).once("value")

        //Firebase call success
        .then(function (projectsnapshot) {

            var project = projectsnapshot.val();

            //Get the Owner Info of the project
            firebase.database().ref("persons").child(projectsnapshot.val().owner).once("value")

            //Firebase call success
            .then(function (ownersnapshot) {

                //Add the Owner data to the Project
                project.ownername = ownersnapshot.val().displayname;
                project.ownerimageurl = ownersnapshot.val().imageurl;
                project.ownericonurl = ownersnapshot.val().iconurl;


                //resolve the promise and return the data
                defer.resolve(project);

            })

            // Getting the Owner Failed
            .catch(function (error) {

                //reject the error
                defer.reject(error);

            });


        })

        // Getting the Project Failed
        .catch(function (error) {

            //reject the error
            defer.reject(error);

        });


        //Return the Promise to the caller
        return defer.promise;


    };

    //Read Project plus owner and plexus info Function
    factory.readextended = function (id) {

        //------------------------------------------------------------------------------------------//
        // Factory Project.readextended - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to reading existing project and its steps in the database.  
        // Factory requires the following parameters:
        //   1) id : The ID of the project to read. 
        //-----------------------------------------------------------------------------------------// 
        
        //Create the Defered Promise Object
        var defer = $q.defer()

        //Get the project data using the project ID
        firebase.database().ref('projects/' + id).once("value")

        //Firebase call success
        .then(function (projectsnapshot) {

            var project = projectsnapshot.val();

            //Get the Owner Info of the project
            firebase.database().ref("persons").child(projectsnapshot.val().owner).once("value")

            //Firebase call success
            .then(function (ownersnapshot) {

                //Add the Owner data to the Project
                project.ownername = ownersnapshot.val().displayname;
                project.ownerimageurl = ownersnapshot.val().image_servingURL;
                project.ownericonurl = ownersnapshot.val().avatar_servingURL;

                //Call the Asset factory to get the asset list
                Asset.readassets(id)

                //Factory call succeeded
                .then(function (assetlist) {

                    //add the assets to the project object
                    project.asset_icons = assetlist;

                    //resolve the promise and return the data
                    defer.resolve(project);

                });

            });

        });


        //Return the Promise to the caller
        return defer.promise;

    };

    //Read Projects Function
    factory.readprojects = function (id) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Project.readprojects - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to reading projects of existing person in the database.  
        // Factory requires the following parameters:
        //   1) id : The ID of the person to have projects read from. 
        //-----------------------------------------------------------------------------------------// 
        
        //Create the Defered Promise Object
        var defer = $q.defer()

        var projectlist = [];

        firebase.database().ref("project_icons").orderByChild("owner").equalTo(id).on("child_added", function (projectsnapshot) {

            projectlist.push(projectsnapshot.val());

            defer.resolve(projectlist);

        });

        //Return the Promise to the caller
        return defer.promise;

        console.log('read projects');

    };

    //Update Project Function
    factory.update = function (project, imagechanged, imageid, fileid, tags) {

        //------------------------------------------------------------------------------------------//
        // Factory Project.update - Verson 1.0 - BML 4/16/2017
        // Factory performs all activity related to updating an existing project in the database.  
        // Factory requires the following parameters:
        //   1) project : The Data Model of the Project that is to be saved. 
        //   2) imagechanged: Flag for if a new Image has been selected
        //   3) image : The id of the HTML Image Tag of the Image that is to be used as the Project Image. 
        //   4) file : The ID of the HTML File input box that contains the orginal image file chosen by the user.
        //   5) tags : The Tags from the updated Project
        //-----------------------------------------------------------------------------------------//  

        //Authentication Check
        if (firebase.auth().currentUser) {

            //Create the Defered Promise Object
            var defer = $q.defer();

            //Update the Application Status
            $rootScope.status = "Editing Your Project"

            //Clear asset icons from readextended
            project.asset_icons = null;

            //Handle null description
            if (project.description == null) {
                project.description = ""
            }

            //Add Project Attributes to the project model
            project.date_modified = firebase.database.ServerValue.TIMESTAMP;
            project.ownername = null;
            project.ownerimageurl = null;
            project.ownericonurl = null;
            var deletefileid = project.image_filename;

            //Update Project
            firebase.database().ref('projects/' + project.id).update(project)

            //Firebase call success
            .then(function () {

                firebase.database().ref('projects/' + project.id).child("tags").remove()

                //Firebase call success
                .then(function () {

                    //Send tags to tag factory
                    Tag.create(project.id, "project", tags)

                })

                // Remove Tags Failed
                .catch(function (error) {

                    //reject the error
                    defer.reject(error);

                });


            })

            // Getting the Project Create Failed
            .catch(function (error) {

                //reject the error
                defer.reject(error);

            });



            //Update Project Icon
            firebase.database().ref('project_icons/' + project.id).update({
                title: project.title,
                description: project.description,
                date_modified: project.date_modified
            })
            
            
            //Set the Activity
            Activity.create("edit", project.id, "project")


            //If Image has changed
            if (imagechanged == true) {

                //Delete Existing Image
                Image.delete(deletefileid)

                .then(function (result) {

                    //Call the Image Factory to save the object
                    Image.save(imageid, 'project', project.id)

                    //Factory call succeeded
                    .then(function (data) {
                        
                        //resolve the promise and return the data
                        defer.resolve(project);

                    })

                    //Factory call failed
                    .catch(function (error) {

                        console.log(error);

                        //reject the error
                        defer.reject(error);

                    });

                })

                .catch(function (error) {

                    //Log the Error
                    console.log('Delete Image Failed')
                    console.log(error.message)

                })

            } else {

                //resolve the promise and return the data
                defer.resolve(project);

            }

            //Return the Promise to the caller
            return defer.promise;

            console.log('update project');

        } else { //authentication failed

            console.log('authorization failure');

        }

    };

    //Delete Project Function
    factory.delete = function (id) {

        //------------------------------------------------------------------------------------------//
        // Factory Project.delete - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to deleting an existing project from the database.  
        // Factory requires the following parameters:
        //   1) id : The ID of the project to be deleted. 
        //-----------------------------------------------------------------------------------------// 

        //Authentication Check
        if (firebase.auth().currentUser) {

            //Create the Defered Promise Object
            var defer = $q.defer()

            //get project assets
            Asset.readassets(id)

            //factory call succeeded
            .then(function (assetlist) {
                
                //remove project tags
                firebase.database().ref("projects").child(id).child("tags").on("child_added", function (tag) {

                    //remove tagged object if exists
                    firebase.database().ref('tagged_objects').child(tag.key).child("projects").child(id).once("value", function (taggedobject) {

                        var taggedobjectexists = taggedobject.exists();

                        if (taggedobjectexists) {
                            firebase.database().ref("tagged_objects").child(tag.key).child("projects").child(id).remove();
                        } 

                    })

                })

                //loop assets in assetlist
                angular.forEach(assetlist, function (value, key) {

                    //loop project assets in Asset.delete
                    Asset.delete(value.id, id)

                })

                //remove project data              
                var fileid

                //get image_filename
                firebase.database().ref('projects/' + id + '/image_filename').once("value", function (snapshot) {

                    fileid = snapshot.val()
                })

                //imagekey Success
                .then(function () {

                    //resolve the promise and return the data
                    defer.resolve(fileid)

                    //delete the project image from storage
                    Image.delete(fileid)
                                                                                       
                    //delete project
                    firebase.database().ref('projects/' + id).remove()

                    //delete project icon
                    firebase.database().ref('project_icons/' + id).remove()                   

                    //delete the Person index to the Project
                    firebase.database().ref("persons").child(firebase.auth().currentUser.uid).child("projects").child(id).remove()

                    //delete project social if exists
                    firebase.database().ref('project_social').child(id).once("value", function (projectsocial) {

                        var projectsocialexists = projectsocial.exists();

                        if (projectsocialexists) {
                            firebase.database().ref('project_social').child(id).remove();
                        } 

                    })
                    
                    //delete project comments if exists
                    firebase.database().ref('comments').child('projects').child(id).once("value", function (projectcomments) {

                        var projectcommentsexists = projectcomments.exists();

                        if (projectcommentsexists) {
                            firebase.database().ref('comments').child('projects').child(id).remove();
                        } 

                    })
                    
                    
                })

                //imagekey Failed
                .catch(function (error) {

                    //reject the promise with an error
                    defer.reject(error);

                });

            });

            //Return the Promise to the caller
            return defer.promise;

            console.log('delete project');

        } else { //authentication failed

            console.log('authorization failure');

        }

    };

    //Return the Factory code
    return factory;

});

//Factory that manages Tag Records in the Firebase
angularApp.factory("Tag", function ($q) {

    //initialize the factory object
    var factory = {};
    
    //Create Tags Function
    factory.create = function (id, type, tags) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Tag.create - Verson 1.0 - BML 5/08/2017
        // Factory performs all activity related to saving an objects tags to the database.  
        // Factory requires the following parameters:
        //   1) id : The id of the object to be tagged.  
        //   2) type : The type of object to be tagged.  
        //   3) tags : Array of tags from the objet.
        //-----------------------------------------------------------------------------------------//  
        
        //initialize the arrays
        var tagpush = [];
        var addtag = [];

        //Authentication Check
        if (firebase.auth().currentUser) {

            //Create the Defered Promise Object
            var defer = $q.defer()

        //Loop through tags in scope
        angular.forEach(tags, function(value,index){

            //Trim spaces
            var trimtitle = value.title.replace(/\s+/g, '');

            //Make tag name lowercase
            var title = trimtitle.toLowerCase();
                        
            //See if tag is already assigned ID
            if(value.id) //was either existing or added by autocomplete
                {
                 //Add Tag to Push Scope
                    tagpush.push({
                        id: value.id,
                        title: title
                          });                                      

                }

            else //This tag was added by hand
                {                                                                                                          
                    firebase.database().ref('tags').orderByChild("title").equalTo(title).once("value", function(tagshot){  

                        var tagexists = tagshot.exists();

                        if(tagexists) //tag already exists so get its key
                            {                

                                firebase.database().ref('tags').orderByChild("title").equalTo(title).once("child_added", function(extagshot){  

                                    //Add Tag to Push Scope
                                    tagpush.push({
                                        id: extagshot.key,
                                        title: title
                                          });

                               })

                            }
                        else  //tag doesnt exist so create it
                            {

                               //Create a "newtagRef" to represent the newly added object.
                                var newtagRef = firebase.database().ref("tags").push();

                                //Create addtag scope 
                                var addtag = {
                                title: title,
                                date_created: firebase.database.ServerValue.TIMESTAMP
                                };                                                              

                                //Set the Tag to the server
                                firebase.database().ref("tags").child(newtagRef.key).set(addtag);                                

                                 //Add Tag to Push Scope 
                          
                                tagpush.push({
                                    id: newtagRef.key,
                                    title: title
                                      });                       

                            }

                    })                                               

                }          

        })           
            
            
             //see if $scope.tagpush has tags
            if(tagpush.length !== 0)
                {
                    
                    console.log("tags to push");
                    
                    angular.forEach(tagpush, function(value, index){
                
                        //set tags  
                        firebase.database().ref(type + "s/" + id + "/tags/" + value.id).set({
                            id: value.id,
                            title: value.title
                        });  

                        //set project_tags
                        firebase.database().ref("tagged_objects").child(value.id).child(type + "s").child(id).set(true);

                   })                                                                                         

                }             
            

            console.log('create tags');

        } else { //authentication failed

            console.log('authorization failure');

        }

    };

    //Read Tags Function
    factory.read = function () {

        console.log('read tags');

    };

    //Update Tag Function
    factory.update = function () {

        console.log('update tag');

    };

    //Delete Tag Function
    factory.delete = function () {

        console.log('delete tag');

    };

    //Return the Factory code
    return factory;

});

//Factory that manages User Records in the Firebase
angularApp.factory("User", function ($q) {

    //initialize the factory object
    var factory = {};

    //Create User Function
    factory.create = function (user) {
        
        //------------------------------------------------------------------------------------------//
        // Factory User.create - Verson 1.0 - JDN 04/01/2017
        // User.create performs all activity related to saving a user object to the database. 
        // User.create requires the following parameters:
        //   1) user : The user object to be created. 
        //-----------------------------------------------------------------------------------------//  

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Create the user data under the user node
        firebase.database().ref('users/' + user.uid).set({
            email: user.email,
            date_created: firebase.database.ServerValue.TIMESTAMP,
            date_modified: firebase.database.ServerValue.TIMESTAMP

        })

        //Create User Success
        .then(function () {

            //resolve the promise and return the data
            defer.resolve(user);

        })

        //Create User Failed
        .catch(function (error) {

            //reject the promise with an error
            defer.reject(error);

        });

        console.log('create user');

        //Return the Promise to the caller
        return defer.promise;

    };

    //Read User Function
    factory.read = function () {

        console.log('read user');

    };

    //Update User Function
    factory.update = function () {

        console.log('update user');

    };

    //Delete User Function
    factory.delete = function () {

        console.log('delete user');

    };

    //Return the Factory code
    return factory;

});

// SOCIAL FACTORIES

//Factory that manages Activity Records in the Firebase
angularApp.factory("Activity", function ($q) {

    //initialize the factory object
    var factory = {};

    //Create Activity Function
    factory.create = function (action, object ,type) {

        //------------------------------------------------------------------------------------------//
        // Factory Activity.create - Verson 1.0 - JDN 3/27/2017
        // Factory performs all activity related to saving a new activity to the database.  
        // Factory requires the following parameters:
        //   1) action : The type of event.  
        //   2) object : The id of the object the event is happening to. 
        //   3) type : The kind of object the event is happening to.  
        //-----------------------------------------------------------------------------------------//  
        
        //Authentication Check
        if (firebase.auth().currentUser) {

            //Create the Defered Promise Object
            var defer = $q.defer()

            //Set the Activity                  
            firebase.database().ref('activity/' + firebase.auth().currentUser.uid).push({
                action: action,
                object: object,
                type:  type,
                person: firebase.auth().currentUser.uid,
                date_created: firebase.database.ServerValue.TIMESTAMP

            })
            
                //activity Success
                .then(function () {

                    //resolve the promise and return the data
                    defer.resolve();                    
                })

                //activity Failed
                .catch(function (error) {

                    //reject the promise with an error
                    defer.reject(error);

                });
            
            //Return the Promise to the caller
            return defer.promise;

            console.log('create activity');

        } else { //authentication failed

            console.log('authorization failure');

        }

    };

    //Read Activity Function
    factory.read = function (id) {

        //------------------------------------------------------------------------------------------//
        // Factory Activity.read - Verson 1.0 - JDN 3/27/2017
        // Factory performs all activity related to reading a users activity.  
        // Factory requires the following parameters:
        //   1) id : The id of the user to read activity for.  
        //-----------------------------------------------------------------------------------------//  
        
        //Create the Defered Promise Object
        var defer = $q.defer()

        //Get the Persons Activity using the ID   
        firebase.database().ref('activity/' + id).once("value")

        //Firebase call success
        .then(function (activitysnapshot) {

            var activity = activitysnapshot.val();

            //resolve the promise and return the data
            defer.resolve(activity);

        })

        // Getting the Owner Failed
        .catch(function (error) {

            //reject the error
            defer.reject(error);

        });

        //Return the Promise to the caller
        return defer.promise;

        console.log('read activity');

    };

    //Update Activity Function
    factory.update = function () {

        console.log('update activity');

    };

    //Delete Activity Function
    factory.delete = function () {

        console.log('delete activity');

    };

    //Return the Factory code
    return factory;

});

//Factory that manages Comment Records in the Firebase
angularApp.factory("Comment", function ($q, Social) {

    //initialize the factory object
    var factory = {};

    //Create Comment Function
    factory.create = function (message, action, id, type, owner, reply) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Comment.create - Verson 1.0 - BML 5/14/2017
        // Factory performs all activity related to saving a new comment to the database.  
        // Factory requires the following parameters:
        //   1) message : The comment object
        //   2) action : The action being performed ('comment') in this case
        //   3) id : The ID of the object being commented on
        //   4) type : The type of object that is being commented on 
        //   5) owner : The owner of the object that is being commented on
        //   6) reply : The id of the message being replied to (0 by default)
        //-----------------------------------------------------------------------------------------// 

        //Authentication Check
        if (firebase.auth().currentUser) {

            //Create the Defered Promise Object
            var defer = $q.defer()
            
            //Initialize Models
            var newcomment = {
                date_created: firebase.database.ServerValue.TIMESTAMP,
                owner: firebase.auth().currentUser.uid,
                type : type,
                id : id,
                text: message,
                reply: reply
            };

            //Create a "newstepRef" to represent the newly added object.
            var newcommentRef = firebase.database().ref("comments/" + type + "s/" + id).push();

            //Save the Object to Firebase
            newcommentRef.set(newcomment, function (error) {

                //If something went wrong saving the object to Firebase
                if (error) {

                    console.log("Data could not be saved." + error);

                    //reject the error
                    defer.reject(error);

                }

                //Otherwise, Do this upon completetion of the save
                else {

                    //And Set an index of the New Comment under the Object that it belongs to. 
                    firebase.database().ref(type + "s/" + id + "/comments/" + newcommentRef.key).set(true);

                    //Add the newly created Key back into the comment as "ID"
                    firebase.database().ref("comments/" + type + "s/" + id + "/" + newcommentRef.key + "/id").set(newcommentRef.key);

                    //call Social Factory
                    Social.social(action, id, type, owner)

                        //resolve the promise and return the data
                        defer.resolve(newcomment);                  

                };

            });

            //Return the Promise to the caller
            return defer.promise;

            console.log('create comment');

        } else { //authentication failed

            console.log('authorization failure');

        }

    };

    //Read Comment Function
    factory.read = function () {

        console.log('read comment');

    };

    //Read Object Comments
    factory.readcomments = function (type, id) {

        //Create the Defered Promise Object
        var defer = $q.defer()

        var commentlist = [];
        var commentSnapshot = {};

        firebase.database().ref("comments/" + type + "s/" + id).on("child_added", function (commentSnapshot) {

            var comment = commentSnapshot.val();

            firebase.database().ref("person_icons/" + commentSnapshot.val().owner).once("value", function (ownersnapshot) {

                //Add the Owner data to the Comment
                comment.ownername = ownersnapshot.val().displayname;
                comment.ownericon = ownersnapshot.val().avatar_servingURL;

                //Add to commentlist
                commentlist.push(comment);

                //Resolve promise
                defer.resolve(commentlist);

            });

        });


        //Return the Promise to the caller
        return defer.promise;

        
    };

    //Update Comment Function
    factory.update = function () {

        console.log('update comment');

    };

    //Delete Comment Function
    factory.delete = function () {

        console.log('delete comment');

    };

    //Return the Factory code
    return factory;

});

//Factory that manages News Records in the Firebase
angularApp.factory("News", function ($q) {

    //initialize the factory object
    var factory = {};

    //Create News Function
    factory.create = function (id, type) {

        //Authentication Check
        if (firebase.auth().currentUser) {

            //Create the Defered Promise Object
            var defer = $q.defer()

            //reject the error
            //defer.reject(error);

            //resolve the promise and return the data
            //defer.resolve(newcomment);


            //Return the Promise to the caller
            //return defer.promise;

            console.log('create news');

        } else { //authentication failed

            console.log('authorization failure');

        }

    };

    //Read News Function
    factory.read = function (id) {
        
        //------------------------------------------------------------------------------------------//
        // Factory News.read - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to reading a users news.  
        // Factory requires the following parameters:
        //   1) id : The id of the person to read news from.  
        //-----------------------------------------------------------------------------------------//  

        //Create the Defered Promise Object
        var defer = $q.defer()

        //Get the Persons Activity using the ID   
        firebase.database().ref('news/' + id).once("value")

        //Firebase call success
        .then(function (newssnapshot) {

            var news = newssnapshot.val();

            //resolve the promise and return the data
            defer.resolve(news);

        })

        // Getting the Owner Failed
        .catch(function (error) {

            //reject the error
            defer.reject(error);

        });

        //Return the Promise to the caller
        return defer.promise;

        console.log('read news');

    };

    //Update News Function
    factory.update = function () {

        console.log('update news');

    };

    //Delete News Function
    factory.delete = function () {

        console.log('delete news');

    };

    //Return the Factory code
    return factory;

});

//Factory that manages the social operations
angularApp.factory("Social", function ($q, Auth, Activity) {

    //initialize the factory object
    var factory = {};

    //Do social action 
    factory.social = function (action, id, type, owner, target, targetid) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Social.social - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to performing a social action on an object.  
        // Factory requires the following parameters:
        //   1) action : The type of event.  
        //   2) id : The id of the object the event is happening to. 
        //   3) type : The type of object the event is happening to. 
        //   4) owner : The owner of the object the event is happening to.  
        //   5) target : Optional parameter for type of object commented on (used for count path). 
        //   6) targetid : Optional parameter for id of object commented on (used for count path).  
        //-----------------------------------------------------------------------------------------//  

        //handle optional parameter
        if (typeof target === 'undefined' || targetid === 'undefined') {
            target = 0;
            targetid = 0;
        }

        //add the action to the current users Activity Log                                          
        Activity.create(action, id, type)
        
        //add the action to the Owners news feed. 
        firebase.database().ref('news/' + owner).push({
            object: id,
            type: type,
            action: action,
            person: firebase.auth().currentUser.uid,
            date_created: firebase.database.ServerValue.TIMESTAMP
        });

        //add the social action to the Object_Social List.
        firebase.database().ref(type + "_social/" + id + "/" + action + "/" + firebase.auth().currentUser.uid).set({
            object: id,
            type: type,
            action: action,
            person: firebase.auth().currentUser.uid,
            date_created: firebase.database.ServerValue.TIMESTAMP
        });

        //add the social relationship to the persons social plexus
        firebase.database().ref("social_plexus/" + firebase.auth().currentUser.uid + "/" + type + "/" + id + "/" + action).set({
            date_created: firebase.database.ServerValue.TIMESTAMP
        });

        //if comment because count path is different
        if (type == "comment") {
            //Update the Socal Action counter on the Comment
            firebase.database().ref(type + "s/" + target + "s/" + targetid + "/" + id + "/counts/" + action).once("value", function (data) {

                //Check to see if the social count exists... 
                if (data.val() != null && data !== undefined) {

                    //If it does, then set it to the current value plus 1. 
                    firebase.database().ref(type + "s/" + target + "s/" + targetid + "/" + id + "/counts/" + action).set(data.val() + 1);

                } else {

                    //If it does not exist, then set the social count to 1. 
                    firebase.database().ref(type + "s/" + target + "s/" + targetid + "/" + id + "/counts/" + action).set(1);
                };

            });


        } else {
            //Update the Socal Action counter on the Object
            firebase.database().ref(type + "_icons/" + id + "/counts/" + action).once("value", function (data) {

                //Check to see if the social count exists... 
                if (data.val() != null && data !== undefined) {

                    //If it does, then set it to the current value plus 1. 
                    firebase.database().ref(type + "_icons/" + id + "/counts/" + action).set(data.val() + 1);

                } else {

                    //If it does not exist, then set the social count to 1. 
                    firebase.database().ref(type + "_icons/" + id + "/counts/" + action).set(1);
                };

            });

        }

    };

    //Reverse social action
    factory.unsocial = function (action, id, type, owner, target, targetid) {

        //------------------------------------------------------------------------------------------//
        // Factory Social.unsocial - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to removing a social action on an object.  
        // Factory requires the following parameters:
        //   1) action : The type of event.  
        //   2) id : The id of the object the event is happening to. 
        //   3) type : The type of object the event is happening to. 
        //   4) owner : The owner of the object the event is happening to.  
        //   5) target : Optional parameter for type of object commented on (used for count path). 
        //   6) targetid : Optional parameter for id of object commented on (used for count path).  
        //-----------------------------------------------------------------------------------------//  
        
        //handle optional parameter
        if (typeof target === 'undefined' || targetid === 'undefined') {
            target = 0;
            targetid = 0;
        }

        //remove the action to the current users Activity Log
        var activityRef = firebase.database().ref("activity/" + firebase.auth().currentUser.uid).orderByChild("object").equalTo(id);

        activityRef.on('value', function (activitydata) {

            //for every social interaction on this object by this user
            activityRef.on("child_added", function (activitykeys) {

                //if the actions match remove the entry
                if (activitykeys.val().action == action) {
                    firebase.database().ref("activity/" + firebase.auth().currentUser.uid + "/" + activitykeys.key).remove();
                }

            });
        });

        //remove the action to the Owners news feed. 
        var newsRef = firebase.database().ref("news/" + firebase.auth().currentUser.uid).orderByChild("object").equalTo(id);

        newsRef.on('value', function (newsdata) {

            //for every social interaction on this object by this user
            newsRef.on("child_added", function (newskeys) {

                //if the actions match remove the entry
                if (newskeys.val().action == action) {
                    firebase.database().ref("news/" + firebase.auth().currentUser.uid + "/" + newskeys.key).remove();
                }

            });
        });

        //remove the social action from the Object_Social List.
        firebase.database().ref(type + "_social/" + id + "/" + action + "/" + firebase.auth().currentUser.uid).remove();


        //remove relationship from the persons social plexus
        firebase.database().ref("social_plexus/" + firebase.auth().currentUser.uid + "/" + type + "/" + id + "/" + action).remove();

        //if comment because count path is different
        if (type == "comment") {
            //Update the Socal Action counter on the Object
            firebase.database().ref(type + "s/" + target + "s/" + targetid + "/" + id + "/counts/" + action).once("value", function (data) {

                //Check to see if the social count exists... 
                if (data.val() != null && data !== undefined) {

                    //If it does, then set it to the current value minus 1. 
                    firebase.database().ref(type + "s/" + target + "s/" + targetid + "/" + id + "/counts/" + action).set(data.val() - 1);

                } else {

                    //If it does not exist, then set the social count to 0. 
                    firebase.database().ref(type + "s/" + target + "s/" + targetid + "/" + id + "/counts/" + action).set(0);

                };

            });
        } else {
            //Update the Socal Action counter on the Object
            firebase.database().ref(type + "_icons/" + id + "/counts/" + action).once("value", function (data) {

                //Check to see if the social count exists... 
                if (data.val() != null && data !== undefined) {

                    //If it does, then set it to the current value minus 1. 
                    firebase.database().ref(type + "_icons/" + id + "/counts/" + action).set(data.val() - 1);

                } else {

                    //If it does not exist, then set the social count to 0. 
                    firebase.database().ref(type + "_icons/" + id + "/counts/" + action).set(0);

                };

            });
        }

    };
    
    //Get likes 
    factory.readaction = function (id, action) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Social.readaction - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to reading a users given action.  
        // Factory requires the following parameters:
        //   1) id : The id of the user to read likes for. 
        //   2) action: The action to filter for.
        //-----------------------------------------------------------------------------------------// 
        
        //Create the Defered Promise Object
        var defer = $q.defer()

        //Get the Persons Activity using the ID   
        firebase.database().ref('activity/' + id).orderByChild("action").equalTo(action).once("value")

        //Firebase call success
        .then(function (activitysnapshot) {

            var activity = activitysnapshot.val();

            //resolve the promise and return the data
            defer.resolve(activity);

        })

        // Getting the Owner Failed
        .catch(function (error) {

            //reject the error
            defer.reject(error);

        });

        //Return the Promise to the caller
        return defer.promise;

        console.log('read action');

    };
    
    //Get followers 
    factory.readfollowers = function (id) {

        //------------------------------------------------------------------------------------------//
        // Factory Social.readfollowers - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to reading a users followers.  
        // Factory requires the following parameters:
        //   1) id : The id of the user to read followers for.  
        //-----------------------------------------------------------------------------------------// 
        
        //Create the Defered Promise Object
        var defer = $q.defer()

        //Initialize the Followers Model 
        var followers = [];
        
        //For each Follower under the User...
        firebase.database().ref('news/' + id).orderByChild("action").equalTo("follow").on("child_added", function(followersdata) {
            
            var follower = followersdata.val();
            
            //Get follower icon and name
            firebase.database().ref("persons").child(followersdata.val().person).once("value", function(followericon) {
                                
                //Add the Owner data to the Comment
                follower.displayname = followericon.val().displayname;
                follower.image = followericon.val().image_servingURL;

                //Add to followers
                followers.push(follower);

                //Resolve promise
                defer.resolve(followers);
                          
            })
            
        })

        //Return the Promise to the caller
        return defer.promise;

        console.log('read followers');

    };
    
    //Get following
    factory.readfollowing = function (id) {
        
        //------------------------------------------------------------------------------------------//
        // Factory Social.readfollowing - Verson 1.0 - BML 5/07/2017
        // Factory performs all activity related to reading what a user is following.  
        // Factory requires the following parameters:
        //   1) id : The id of the user to read following for.  
        //-----------------------------------------------------------------------------------------//

        //Create the Defered Promise Object
        var defer = $q.defer()
        
        //Initialize the Followers Model 
        var followers = [];

        //For each Following under the User...
        firebase.database().ref('activity/' + id).orderByChild("action").equalTo("follow").on("child_added", function(followersdata) {
            
            var follower = followersdata.val();
            
            //Get follower icon and name
            firebase.database().ref("persons").child(followersdata.val().object).once("value", function(followericon) {
                                
                //Add the Owner data to the Comment
                follower.displayname = followericon.val().displayname;
                follower.image = followericon.val().image_servingURL;

                //Add to followers
                followers.push(follower);

                //Resolve promise
                defer.resolve(followers);
                          
            })
            
        })

        //Return the Promise to the caller
        return defer.promise;

        console.log('read following');

    };    

    //return the factory to whatever called it so the functions inside can be used. 
    return factory;

});