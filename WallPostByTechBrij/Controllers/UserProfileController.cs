using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using WallPostByTechBrij.Manager;
using WallPostByTechBrij.Models;
using WebMatrix.WebData;

namespace WallPostByTechBrij.Controllers
{
 
    public class UserProfileController : Controller
    {
        private WallEntities db = new WallEntities();

        private string aStatus;
        private bool isFriendRequestAllreadySend;


        public ActionResult SendRequest(int id)
        {
            
            LogicManager aManager=new LogicManager();
            isFriendRequestAllreadySend = aManager.CheckFriendShip(id);
            if (!isFriendRequestAllreadySend)
            {
                Friendship aFriendship = new Friendship();
                aFriendship.FriendId = WebSecurity.CurrentUserId;
                aFriendship.UserId = id;
                aFriendship.Status = 0;
                db.Friendships.Add(aFriendship);
                db.SaveChanges();
                Session["Status"] = "Your friend request has been send successfully!!!!";
            }
            else
            {
                Session["Status"] = "You already made a friend request to him or her!!Please wait for his or her confirmation!!!";
                
            }
           

            //var user = db.UserProfiles.Find(WebSecurity.CurrentUserId);
            //user.FirstName = userprofile.FirstName;
            //user.LastName = userprofile.LastName;
            //user.Address = userprofile.Address;
            //user.Email = userprofile.Email;
            //user.Phone = userprofile.Phone;
            //user.AboutMe = userprofile.AboutMe;



            //if (ModelState.IsValid)
            //{
            //    db.UserProfiles.AddOrUpdate(user);
            //    //db.Entry(userprofile).State = EntityState.Modified;
            //    db.SaveChanges();
            //    return RedirectToAction("Index");
            //}
            return RedirectToAction("AllFriend");
        }

    [HttpPost]
        public ActionResult FileUpload(HttpPostedFileBase file)
        {
            if (file != null)
            {
                string pic = System.IO.Path.GetFileName(file.FileName);
                string path = System.IO.Path.Combine(
                                       Server.MapPath("~/Images/ProfileImages"), pic);
                // file is uploaded
                file.SaveAs(path);

                // save the image path path to the database or you can send image
                // directly to database
                // in-case if you want to store byte[] ie. for DB
                using (MemoryStream ms = new MemoryStream())
                {
                    file.InputStream.CopyTo(ms);
                  //  byte[] array = ms.GetBuffer();
                    db.UserProfiles.Find(WebSecurity.CurrentUserId).Picture = ms.GetBuffer();
                }
                db.SaveChanges();
            }
            //else
            //{
            //    HttpPostedFileBase file=new HttpPostedFileWrapper();
            //    string physicalPath = Server.MapPath("~/Images/ProfileImages/" + "user.png");
            //    if(physicalPath!=null)
            //    file.SaveAs(physicalPath);
            //}
            // after successfully uploading redirect the user
           // return RedirectToAction("actionname", "controller name");
            return RedirectToAction("Index");
        }

    public ActionResult GetImage(int id)
    {
        UserProfile userProfile=new UserProfile();
   
        byte[] imageData = db.UserProfiles.Find(id).Picture;
        if (imageData == null)
            return RedirectToAction("Index");
            
        return File(imageData, "~/Images/ProfileImages");
    }

        // GET: /UserProfile/

        public ActionResult AllFriend()
        {
            IEnumerable<UserProfile> userProfiles=new List<UserProfile>();
            ViewBag.Status = Session["Status"];
            return View(userProfiles);
        }
        public ActionResult Index()
        {
            var userfrofile = db.UserProfiles.Find(WebSecurity.CurrentUserId);
            return View(userfrofile);

        }

        [HttpPost]
        public ActionResult AllFriend(string searchString)
        {
            var userProfiles = from m in db.UserProfiles
                               select m;
            
          LogicManager aLogicManager=new LogicManager();
            List<int> myfriends=aLogicManager.GetAllfriend(WebSecurity.CurrentUserId);
                 
            if (!String.IsNullOrEmpty(searchString))
            {
                foreach (var myfriend in myfriends)
                {
                    userProfiles = userProfiles.Where(s=>s.UserId!=myfriend);
                }
                userProfiles = userProfiles.Where(s => s.FirstName.Contains(searchString)&&s.UserId!=WebSecurity.CurrentUserId);
          
            }
            else
            {
               
                IEnumerable<UserProfile> Profiles = new List<UserProfile>();
                return View(Profiles);
            }
            return View(userProfiles.ToList());
        }
        // GET: /UserProfile/Create

        public ActionResult Create()
        {
            return View();
        }

        //
        // POST: /UserProfile/Create

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(UserProfile userprofile)
        {
            if (ModelState.IsValid)
            {
                db.UserProfiles.Add(userprofile);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(userprofile);
        }

        //
        // GET: /UserProfile/Edit/5

        public ActionResult Edit(int id = 0)
        {
            UserProfile userprofile = db.UserProfiles.Find(id);
            if (userprofile == null)
            {
                return HttpNotFound();
            }
            return View(userprofile);
        }

        //
        // POST: /UserProfile/Edit/5

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(UserProfile userprofile)
        {
          
            var user = db.UserProfiles.Find(WebSecurity.CurrentUserId);
            if(userprofile.FirstName!=null)
            user.FirstName = userprofile.FirstName;
            if (userprofile.LastName != null)
            user.LastName = userprofile.LastName;
            if (userprofile.Address != null)
            user.Address = userprofile.Address;
            if (userprofile.Email != null)
            user.Email = userprofile.Email;
            if (userprofile.Phone != null)
            user.Phone = userprofile.Phone;
            if (userprofile.AboutMe != null)
            user.AboutMe = userprofile.AboutMe;

            

            if (ModelState.IsValid)
            {
                db.UserProfiles.AddOrUpdate(user);
                //db.Entry(userprofile).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(userprofile);
        }

        //
        // GET: /UserProfile/Delete/5

        public ActionResult Delete(int id = 0)
        {
            UserProfile userprofile = db.UserProfiles.Find(id);
            if (userprofile == null)
            {
                return HttpNotFound();
            }
            return View(userprofile);
        }

        //
        // POST: /UserProfile/Delete/5

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            UserProfile userprofile = db.UserProfiles.Find(id);
            db.UserProfiles.Remove(userprofile);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}