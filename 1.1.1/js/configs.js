angularApp.config(function ($routeProvider, $locationProvider) {

    $routeProvider

    //Routes for General Areas 

    .when('/', {
        controller: 'homeCtrl',
        templateUrl: '/1.1.1/html/home/home.html',
        routedata: {
            secure: false,
            title: 'Home',
            area: 'Public'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })
    
    .when('/info/', {
        controller: 'infoCtrl',
        templateUrl: '/1.1.1/html/info/about.html',
        routedata: {
            secure: false,
            title: 'Info'
        },
        secure: false,
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/terms/', {
        controller: 'termsCtrl',
        templateUrl: '/1.1.1/html/info/terms.html',
        routedata: {
            secure: false,
            title: 'Terms'
        },
        secure: false,
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/privacy/', {
        controller: 'privacyCtrl',
        templateUrl: '/1.1.1/html/info/privacy.html',
        routedata: {
            secure: false,
            title: 'Privacy'
        },
        secure: false,
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/contact/', {
        controller: 'contactCtrl',
        templateUrl: '/1.1.1/html/info/contact.html',
        routedata: {
            secure: false,
            title: 'Contact'
        },
        secure: false,
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })
    
    //Routes for Account Areas

    .when('/login/', {
        controller: 'loginCtrl',
        templateUrl: '/1.1.1/html/login/login.html',
        routedata: {
            secure: false,
            title: 'Login',
            area: 'Public'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/register/one/', {
        controller: 'register_oneCtrl',
        templateUrl: '/1.1.1/html/register/register_one.html',
        routedata: {
            secure: false,
            title: 'Add Profile Pic',
            area: 'Register'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/register/two/', {
        controller: 'register_twoCtrl',
        templateUrl: '/1.1.1/html/register/register_two.html',
        routedata: {
            secure: false,
            title: 'Add Profile Info',
            area: 'Register'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    
    //Routes for Project Areas   

    .when('/project/:projectId/', {
        controller: 'projectCtrl',
        templateUrl: '/1.1.1/html/public/project.html',
        routedata: {
            secure: false,
            title: 'View Project',
            area: 'Public'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/project/:projectId/page/', {
        controller: 'projectPageCtrl',
        templateUrl: '/1.1.1/html/public/project_page.html',
        routedata: {
            secure: false,
            title: 'Project Page',
            area: 'Public'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/project/:projectId/asset/:assetId/', {
        controller: 'assetCtrl',
        templateUrl: '/1.1.1/html/public/asset.html',
        routedata: {
            secure: false,
            title: 'Asset',
            area: 'Public'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/tagged/:tagId/', {
        controller: 'taggedCtrl',
        templateUrl: '/1.1.1/html/public/tagged.html',
        routedata: {
            secure: false,
            title: 'Tagged',
            area: 'Public'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    
    //Routes for the Console Areas   

    .when('/console/home/', {
        controller: 'consoleHomeCtrl',
        templateUrl: '/1.1.1/html/console/console_home.html',
        routedata: {
            secure: true,
            title: 'Console - Home',
            area: 'Home'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/projects/', {
        controller: 'consoleProjectsCtrl',
        templateUrl: '/1.1.1/html/console/console_projects.html',
        routedata: {
            secure: true,
            title: 'My Projects',
            area: 'Projects'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/project/:projectId/', {
        controller: 'consoleProjectCtrl',
        templateUrl: '/1.1.1/html/console/console_project.html',
        routedata: {
            access: '0',
            title: 'View Project',
            area: 'Projects'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/addproject/', {
        controller: 'consoleAddProjectCtrl',
        templateUrl: '/1.1.1/html/console/console_addproject.html',
        routedata: {
            access: '0',
            title: 'Add New Project',
            area: 'Projects'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/editproject/:projectId/', {
        controller: 'consoleEditProjectCtrl',
        templateUrl: '/1.1.1/html/console/console_editproject.html',
        routedata: {
            access: '0',
            title: 'Edit Project',
            area: 'Projects'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/addasset/:projectId/', {
        controller: 'consoleAddAssetCtrl',
        templateUrl: '/1.1.1/html/console/console_addasset.html',
        routedata: {
            access: '0',
            title: 'Add Asset',
            area: 'Projects'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/project/:projectId/editasset/:assetId/', {
        controller: 'consoleEditAssetCtrl',
        templateUrl: '/1.1.1/html/console/console_editasset.html',
        routedata: {
            access: '0',
            title: 'Edit Asset',
            area: 'Projects'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/following/', {
        controller: 'consoleFollowingCtrl',
        templateUrl: '/1.1.1/html/console/console_following.html',
        routedata: {
            secure: true,
            title: 'View Following',
            area: 'Following'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/followers/', {
        controller: 'consoleFollowersCtrl',
        templateUrl: '/1.1.1/html/console/console_followers.html',
        routedata: {
            secure: true,
            title: 'View Followers',
            area: 'Followers'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/comments/', {
        controller: 'consoleCommentsCtrl',
        templateUrl: '/1.1.1/html/console/console_comments.html',
        routedata: {
            secure: true,
            title: 'View Comments',
            area: 'Comments'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/favorites/', {
        controller: 'consoleFavoritesCtrl',
        templateUrl: '/1.1.1/html/console/console_favorites.html',
        routedata: {
            secure: true,
            title: 'View Favorites',
            area: 'Favorites'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/likes/', {
        controller: 'consoleLikesCtrl',
        templateUrl: '/1.1.1/html/console/console_likes.html',
        routedata: {
            secure: true,
            title: 'View Likes',
            area: 'Likes'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/account/', {
        controller: 'consoleAccountCtrl',
        templateUrl: '/1.1.1/html/console/console_account.html',
        routedata: {
            secure: true,
            title: 'View Settings',
            area: 'Settings'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/console/account/updateimage/', {
        controller: 'consoleAccount_updateimageCtrl',
        templateUrl: '/1.1.1/html/console/console_account_updateimage.html',
        routedata: {
            secure: true,
            title: 'Update Profile Image',
            area: 'Settings'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    
    //Routes for the Person Areas

    .when('/person/:personId/', {
        controller: 'personHomeCtrl',
        templateUrl: '/1.1.1/html/person/person_home.html',
        routedata: {
            secure: false,
            title: 'Home'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/person/:personId/projects/', {
        controller: 'personProjectsCtrl',
        templateUrl: '/1.1.1/html/person/person_projects.html',
        routedata: {
            secure: false,
            title: 'Projects'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/person/:personId/following/', {
        controller: 'personFollowingCtrl',
        templateUrl: '/1.1.1/html/person/person_following.html',
        routedata: {
            secure: false,
            title: 'Following'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/person/:personId/followers/', {
        controller: 'personFollowersCtrl',
        templateUrl: '/1.1.1/html/person/person_followers.html',
        routedata: {
            secure: false,
            title: 'Followers'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/person/:personId/comments/', {
        controller: 'personCommentsCtrl',
        templateUrl: '/1.1.1/html/person/person_comments.html',
        routedata: {
            secure: false,
            title: 'Comments'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/person/:personId/likes/', {
        controller: 'personLikesCtrl',
        templateUrl: '/1.1.1/html/person/person_likes.html',
        routedata: {
            secure: false,
            title: 'Likes'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    
    //Importer Routes

    .when('/importimgur/', {
        controller: 'importimgurCtrl',
        templateUrl: '/1.1.1/import/importimgur.html',
        routedata: {
            secure: true,
            title: 'Import Project'
        },
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    
    //Old Routes  

    .when('/test/', {
        controller: 'testCtrl',
        templateUrl: '/1.1.1/html/public/test.html',
        routedata: {
            secure: false,
            title: 'Test'
        },
        secure: false,
        resolve: {
            message: function (General) {
                return General.routeload();
            }
        }
    })

    .when('/all/', {
        controller: 'allCtrl',
        templateUrl: 'html/public/all.html',
        routedata: {
            access: '0',
            title: 'All'
        },
        secure: false,
        resolve: { //route will not be loaded until the Routeload Factory finishes.
            'Routeload': function (Routeload) {
                return Routeload.load();
            }
        }
    })

    .when('/secure/', {
        controller: 'secureCtrl',
        templateUrl: 'html/public/secure.html',
        routedata: {
            access: '0',
            title: 'Secure'
        },
        secure: false,
        resolve: { //route will not be loaded until the Routeload Factory finishes.
            'Routeload': function (Routeload) {
                return Routeload.load();
            }
        }
    })
    
    
    //If the Route is not found
    .otherwise({
        redirectTo: '/'
    });

    
    // use the HTML5 History API
    $locationProvider.html5Mode(true);

});