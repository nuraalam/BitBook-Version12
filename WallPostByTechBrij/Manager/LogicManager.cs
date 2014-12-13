using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WallPostByTechBrij.Models;
using WebGrease.Css.Extensions;
using WebMatrix.WebData;

namespace WallPostByTechBrij.Manager
{
    public class LogicManager
    {
        WallEntities db=new WallEntities();
        public bool CheckLike(Like like)
        {
            return db.Likes.ToList().Where(aLike => aLike.PostId == like.PostId).All(aLike => aLike.LikeBy != like.LikeBy);
        }

        public void IncreaseLike(Like like)
        {
            var aPost = db.Posts.Find(like.PostId);
            aPost.LikeCount++;
            db.Posts.AddOrUpdate(aPost);
            db.SaveChanges();
        }

        public void DecreaseLike(Like like)
        {
            var aPost = db.Posts.Find(like.PostId);
            aPost.LikeCount--;
            db.Posts.AddOrUpdate(aPost);
            db.SaveChanges();
            foreach (var aLike in db.Likes.ToList())
            {
                if (aLike.PostId==like.PostId)
                {
                    if (aLike.LikeBy == like.LikeBy)
                    {
                        db.Likes.Remove(aLike);
                        db.SaveChanges();
                    }
                    
                }
            }
        

        }

        public List<int> GetAllfriend(int currentUserId)
        {
            List<int> myfriendList=new List<int>();
            foreach (var friend in db.Friendships.ToList())
            {
                if (friend.UserId == currentUserId)
                {
                    myfriendList.Add((int) friend.FriendId);
                }
            }
            return myfriendList;
        }

        public bool CheckFriendShip(int id)
        {
            foreach (var afriendship in db.Friendships.ToList())
            {
                if (afriendship.UserId==id)
                {
                    if (afriendship.FriendId == WebSecurity.CurrentUserId)
                    {
                        return true;
                    }
                }
                
            }
            return false;
        }

        public List<Post> GetPostList()
        {
            List<int> meAndMyFriedsList=new List<int>();
            List<Post> posts=new List<Post>();
            foreach (var friend in db.Friendships.ToList())
            {
                if (friend.UserId == WebSecurity.CurrentUserId)
                {
                    if (friend.Status==1)
                    {
                        meAndMyFriedsList.Add((int)friend.FriendId);
                    }
                }
            }
            meAndMyFriedsList.Add(WebSecurity.CurrentUserId);

            foreach (var post in db.Posts.ToList())
            {
                foreach (var aFriend in meAndMyFriedsList)
                {
                    if (post.PostedBy==aFriend)
                    {
                        posts.Add(post);
                    } 
                }
            }


            return posts;

        }

        public List<int> GetAllfriendIncludingPendingRequest(int currentUserId)
        {
            List<int> myfriendList = new List<int>();
            foreach (var friend in db.Friendships.ToList())
            {
                if (friend.FriendId == currentUserId)
                {
                    myfriendList.Add((int)friend.UserId);
                }
                if (friend.UserId == currentUserId)
                {
                    myfriendList.Add((int)friend.UserId);
                }
            }
            return myfriendList;
        }

        public bool CheckFriendShipPending(int id)
        {
              foreach (var afriendship in db.Friendships.ToList())
              {
                if (afriendship.UserId==id)
                {
                    if (afriendship.FriendId == WebSecurity.CurrentUserId)
                    {
                        return true;
                    }
                }
                
                }
              foreach (var afriendship in db.Friendships.ToList())
              {
                  if (afriendship.FriendId == id)
                  {
                      if (afriendship.UserId == WebSecurity.CurrentUserId)
                      {
                          return true;
                      }
                  }

              }
            return false;
        }

        public List<UserProfile> GetAllfriendWithProfile(int currentUserId)
        {
            List<int> myfriendsId = new List<int>();
            foreach (var friend in db.Friendships.ToList())
            {
                if (friend.UserId == currentUserId)
                {   if(friend.Status==1)
                    myfriendsId.Add((int)friend.FriendId);
                }
            }
            List<UserProfile> myfriendList = new List<UserProfile>();
            foreach (var friend in db.UserProfiles.ToList())
            {
                foreach (int friendId in myfriendsId)
                {
                    if (friend.UserId == friendId)
                    {
                        
                        myfriendList.Add(friend);
                    }
                }
            }
            return myfriendList;
        }
    }
}