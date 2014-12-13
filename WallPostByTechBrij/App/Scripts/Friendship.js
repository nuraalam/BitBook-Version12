function Friendship(data,hub) {
    var self = this;
    data = data || {};
    self.UserId = data.UserId;
    self.friendbyName = ko.observable(data.friendbyName);
    self.userName = data.friendsNotificationbyName;
    self.friendsNotificationbyName = ko.observable(data.friendsNotificationbyName);
    self.hub = hub;

    self.addFriendships = function () {
        //var previousCount = this.numberOfLikes();
        //this.numberOfLikes(previousCount + 1);

        self.hub.server.addFriendships({ "UserId": self.UserId }).done(function (friendship) {
            //self.PutLike.push(new Like());
            //self.numberOfLikes(like.LikeCount);
            //self.newLikeMessage('');
        }).fail(function (err) {
            self.error(err);
        });
    }
}



function viewModel() {
   
    
    var self = this;
    self.friendships = ko.observableArray();
    self.friendshipNotification = ko.observableArray();
    self.newFriend = ko.observable();
    self.error = ko.observable();
    //SignalR related
   // self.newPosts = ko.observableArray();
    // Reference the proxy for the hub.  
    self.hub = $.connection.friendsHub;
    
    self.init = function () {
        self.error(null);
        self.hub.server.getFriendships().fail(function (err) {
            self.error(err);
        });
        self.hub.server.getFriendshipNotification().fail(function (err) {
            self.error(err);
        });
    }
  
    self.hub.client.loadFriendships = function (data) {
        var mappedFriends = $.map(data, function (item) { return new Friendship(item, self.hub); });
        self.friendships(mappedFriends);
    }
    self.hub.client.loadFriendshipNotification = function (data) {
        var mappedFriends = $.map(data, function (item) { return new Friendship(item, self.hub); });
        self.friendshipNotification(mappedFriends);
    }

    //self.addFriendships = function () {
    //    self.error(null);
    //    self.hub.server.addFriendships({ "UserName": self.newFriend() }).fail(function (err) {
    //        self.error(err);
    //    });
    //}

    //self.hub.client.addFriendships = function (friendship) {
    //    self.friendships.splice(0, 0, new Friendship(friendship, self.hub));
    //    self.newFriend('');
    //}
    
    self.hub.client.error = function (err) {
        self.error(err);
    }
    return self;
    
}




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