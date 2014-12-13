﻿/*  It's user control for wall operations like to add/display status and comments. 
*   Developed By: Brij Mohan
*   Website: http://techbrij.com
*   Developed On: 29 May 2013
*  
*/




function getTimeAgo(varDate) {
    if (varDate) {
        return $.timeago(varDate.toString().slice(-1) == 'Z' ? varDate : varDate + 'Z');
    }
    else {
        return '';
    }
}


// Model
function Post(data, hub) {
    var self = this;
    data = data || {};
    self.PostId = data.PostId;
    self.Message = ko.observable(data.Message || "");
    self.PostedBy = data.PostedBy || "";
    self.PostedByName = data.PostedByName || "";
    self.PostedByAvatar = data.PostedByAvatar || "";
    self.PostedDate = getTimeAgo(data.PostedDate);
    self.LikeCount =data.LikeCount;
    self.error = ko.observable();
    self.PostComments = ko.observableArray();
    self.NewComments = ko.observableArray();
    self.newCommentMessage = ko.observable();
    self.numberOfLikes = ko.observable(self.LikeCount);
    self.PutLike = ko.observableArray();
    self.NewLikes = ko.observableArray();
    self.newLikeMessage = ko.observable();
    self.notificationName = ko.observable();
    self.hub = hub;
    self.addComment = function () {
        self.hub.server.addComment({ "PostId": self.PostId, "Message": self.newCommentMessage() }).done(function (comment) {
            self.PostComments.push(new Comment(comment));
            self.newCommentMessage('');
        }).fail(function (err) {
            self.error(err);
        });        
    }

    self.addLike = function () {
        //var previousCount = this.numberOfLikes();
        //this.numberOfLikes(previousCount + 1);

        self.hub.server.addLike({ "likeBy": self.PostedBy, "PostId": self.PostId }).done(function (like) {
            self.PutLike.push(new Like(like));
            self.numberOfLikes(like.LikeCount);
            self.newLikeMessage('');
        }).fail(function (err) {
            self.error(err);
        });
    }
    
    self.getProfile = function () {
        //var previousCount = this.numberOfLikes();
        //this.numberOfLikes(previousCount + 1);

        self.hub.server.getProfile({ "likeBy": self.PostedBy, "PostId": self.PostId }).done(function (like) {
            //self.PutLike.push(new Like(like));
            //self.numberOfLikes(like.LikeCount);
            //self.newLikeMessage('');
        }).fail(function (err) {
            self.error(err);
        });
    }

    self.loadNewComments = function () {      
        self.PostComments(self.PostComments().concat(self.NewComments()));
        self.NewComments([]);
       
    }
  

    self.loadNewLikes = function () {
        self.PutLike(self.PutLike().concat(self.NewLikes()));
        self.NewLikes([]);
    }

    self.loadAllLikers = function () {

    }
    
    self.toggleComment = function (item, event) {
        $(event.target).next().find('.publishComment').toggle();
    }
   
   
 


    if (data.PostComments) {
        var mappedPosts = $.map(data.PostComments, function (item) { return new Comment(item); });
        self.PostComments(mappedPosts);
    }

  
  
}


function Like(data) {
    var self = this;
    data = data || {};
    self.LikeCount = data.LikeCount;
    self.PostId = data.PostId;
    self.LikedBy = data.LikedBy;
}


function Comment(data) {
    var self = this;
    data = data || {};

    // Persisted properties
    self.CommentId = data.CommentId;
    self.PostId = data.PostId;
    self.Message = ko.observable(data.Message || "");
    self.CommentedBy = data.CommentedBy || "";
    self.CommentedByAvatar = data.CommentedByAvatar || "";
    self.CommentedByName = data.CommentedByName || "";
    self.CommentedDate = getTimeAgo(data.CommentedDate);
    self.error = ko.observable();
  
}




function viewModel() {
    var self = this;
    self.posts = ko.observableArray();
    self.newMessage = ko.observable();
   // self.newLike = ko.observable();
    self.error = ko.observable();


    //SignalR related
    self.newPosts = ko.observableArray();
    // Reference the proxy for the hub.  
    self.hub = $.connection.postHub;


    self.init = function () {
        self.error(null);
        self.hub.server.getPosts().fail(function (err) {
            self.error(err);
        });
    }

    self.addPost = function () {
        self.error(null);
        self.hub.server.addPost({ "Message": self.newMessage() }).fail(function (err) {
            self.error(err);
        });
    }

    self.loadNewPosts = function () {
        self.posts(self.newPosts().concat(self.posts()));
        self.newPosts([]);
    }

    //functions called by the Hub
    self.hub.client.loadPosts = function (data) {
        var mappedPosts = $.map(data, function (item) { return new Post(item, self.hub); });
        self.posts(mappedPosts);
    }

    self.hub.client.addPost = function (post) {
        self.posts.splice(0, 0, new Post(post, self.hub));
        self.newMessage('');
    }

    self.hub.client.newPost = function (post) {
        self.newPosts.splice(0, 0, new Post(post, self.hub));
    }

    self.hub.client.error = function (err) {
        self.error(err);
    }

    self.hub.client.newComment = function (comment, postId) {
        //check in existing posts
        var posts = $.grep(self.posts(), function (item) {
            return item.PostId === postId;
        });
        if (posts.length > 0) {
            posts[0].NewComments.push(new Comment(comment));
            posts[0].notificationName(comment.CommentedByName);
        }
        else {
            //check in new posts (not displayed yet)
            posts = $.grep(self.newPosts(), function (item) {
                return item.PostId === postId;
            });
            if (posts.length > 0) {
                posts[0].NewComments.push(new Comment(comment));
                posts[0].notificationName(comment.CommentedByName);
            }
        }
    }



    self.hub.client.newLike = function (like, postId) {
        //check in existing posts
        var posts = $.grep(self.posts(), function (item) {
            return item.PostId === postId;
        });
        if (posts.length > 0) {
            posts[0].NewLikes.push(new Like(like));
            posts[0].numberOfLikes(like.LikeCount);
            posts[0].notificationName(like.LikedBy);
            //self.numberOfLikes = ko.observable(self.LikeCount);
        }
        else {
            //check in new posts (not displayed yet)
            posts = $.grep(self.newPosts(), function (item) {
                return item.PostId === postId;
            });
            if (posts.length > 0) {
                posts[0].NewLikes.push(new Like(like));
                posts[0].numberOfLikes(like.LikeCount);
                posts[0].notificationName(like.LikedBy);
            }
        }
    }


    return self;
}



//custom bindings
//textarea autosize
ko.bindingHandlers.jqAutoresize = {
    init: function (element, valueAccessor, aBA, vm) {
        if (!$(element).hasClass('msgTextArea')) {
            $(element).css('height', '1em');
        }
        $(element).autosize();
    }
};

var vmPost = new viewModel();
ko.applyBindings(vmPost);
$.connection.hub.start().done(function () {
    vmPost.init();
});
