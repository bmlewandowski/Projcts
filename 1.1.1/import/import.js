angularApp.controller("importimgurCtrl", function ($rootScope, $scope, $http, Project, Asset, Image) {

    $scope.albumid = "kpioG";
        //Initialize the Tags Model
        $scope.tags = [];

        //Handle Autocomplete Filter
        $scope.loadSuggestions = function ($query) {
            var suggestedtags = $rootScope.suggests;
            return suggestedtags.filter(function (suggestedtag) {
                return suggestedtag.title.toLowerCase().indexOf($query.toLowerCase()) != -1;
            });
        };

    // Function to pull External Data from Imgur
    $scope.getData = function (albumid) {

        //Set the UI to view imgur album mode
        $scope.uistate = "viewimgurdata";

        //Make the call to get the Album Data
        $http({
            method: 'get',
            url: "https://api.imgur.com/3/gallery/album/" + albumid,
            headers: {
                Authorization: 'Client-ID c8d76344df457c8',
                'Content-Type': undefined
            }
        })

        .then(function (data, status, headers, config) {

            //log the Imgur Data
            console.log(data.data.data);

            //Setup the Project Model
            $scope.project = {};

            //Populate the Project Model
            $scope.project = {
                title: data.data.data.title,
                description: data.data.data.description
            }

            //Set the Project Image to the Imgur image
            document.getElementById('projectimage001').crossOrigin = "anonymous";
            document.getElementById('projectimage001').src = 'http://i.imgur.com/' + data.data.data.cover + '.jpg';
            
            //Add the Imgur data to scope
            $scope.steps = data.data.data.images;

        }, function (response) {

            console.log('Could not get Imgur Data')

        });

    };

    // Function to save a project
    $scope.save = function () {

        //Call the Project Factory
        Project.create($scope.project, 'projectimage001', 'projectfile001')

        //Project creation succeeded
        .then(function (result) {

            console.log('Project Imported.');
            
            console.log(result);
            
            $scope.stepsaveloop(result.id, 0);

        })

        //Project creation failed
        .catch(function (error) {

            console.log(error);

        });

    };

    //Looping Function to Cycle thru the Steps and Save them One at a time
    $scope.stepsaveloop = function (projectid, arrayindex) {
        
        //Check index to see if you need to exit
        if (arrayindex === $scope.steps.length) {

            //Exit Loop
            return;

        };
        
        //If there is no step title, add one. 
        if($scope.steps[arrayindex].title == null){
            
            $scope.steps[arrayindex].title = "Step " + (arrayindex + 1)

        }
        
        $scope.asset = {
            title:$scope.steps[arrayindex].title,
            description:$scope.steps[arrayindex].description
        };
        
        console.log($scope.steps[arrayindex].id);
        
        
        Asset.create($scope.asset, projectid, $scope.steps[arrayindex].id);

        console.log(arrayindex);
        console.log(projectid);

        //increment the array index
        arrayindex = arrayindex + 1;

        //Self call the function to create the loop. 
        $scope.stepsaveloop(projectid, arrayindex);

    };

});