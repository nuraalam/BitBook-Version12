using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using WallPostByTechBrij.Models;
using WebMatrix.WebData;

namespace WallPostByTechBrij.Hubs
{
    public class FriendsHub:Hub
    {
        public void AddFriendships(Friendship friendship)
        {
            Friendship aFriendship=new Friendship();
            aFriendship.FriendId = WebSecurity.CurrentUserId;
            aFriendship.UserId = friendship.UserId;
            aFriendship.Status = 1;
            using (WallEntities db = new WallEntities())
            {
                foreach (var friendshipcheck in db.Friendships.ToList())
                {
                    if (friendshipcheck.UserId == aFriendship.FriendId)
                    {
                        if (friendshipcheck.FriendId==aFriendship.UserId)
                        {
                            friendshipcheck.Status = 1;
                            db.Friendships.AddOrUpdate(friendshipcheck);
                            db.SaveChanges();
                        }
                    }
                }

                db.Friendships.Add(aFriendship);
                db.SaveChanges();

            }
            GetFriendshipNotification();
            GetFriendships();

        }


        public void GetFriendships()
        {
            Friendship aFriendship=new Friendship();
            aFriendship.UserId = WebSecurity.CurrentUserId;
           
            using (WallEntities db = new WallEntities())
            {
                var friendList=new List<string>();
                foreach (var friend in db.Friendships.ToList())
                {
                    if (friend.UserId==aFriendship.UserId)
                    {
                        if (friend.Status==1)
                        {
                            var usr = db.UserProfiles.FirstOrDefault(x => x.UserId == friend.FriendId);
                            if(usr!=null)
                            friendList.Add(usr.UserName);
                        }
                    }                   
                }



                var ret=(from friendship in friendList
                           select new
                           {
                             friendbyName=friendship, 
                           }).ToArray();
             
               
                Clients.Caller.loadFriendships(ret);
               // return ret;

            }

        }

        public void GetFriendshipNotification()
        {
            Friendship aFriendship = new Friendship();
            aFriendship.UserId = WebSecurity.CurrentUserId;

            using (WallEntities db = new WallEntities())
            {
                var friendList = new List<UserProfile>();
                foreach (var friend in db.Friendships.ToList())
                {
                    if (friend.UserId == aFriendship.UserId)
                    {
                        if (friend.Status == 0)
                        {
                            var usr = db.UserProfiles.FirstOrDefault(x => x.UserId == friend.FriendId);
                            if (usr != null)
                                friendList.Add(usr);
                        }
                    }
                }



                var ret = (from friendship in friendList
                           select new
                           {
                            
                               UserId=friendship.UserId,
                               friendsNotificationbyName = friendship.UserName,
                           }).ToArray();
                
               
                Clients.Caller.loadFriendshipNotification(ret);
              // return ret;

            }

        }
    }
}