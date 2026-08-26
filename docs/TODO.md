1. Styles
2. Google auth
3. Unixsee activities
4. Story (Admin)
5. Complementary services inputs
6. Billing
7. Inside /websites/[id]/page.tsx when users clicks on create ticket and will be redirected to create ticket page, the website  
   should be selected by default in create ticket page
8. Renew Plan in website details page
9. check all empty stats in users dashboard
10. Users profile page
11. when users do logout, don't redirect to auth page and remove their phone from forms.
12. fix all images alt tags.
13. test rate limitting.
14. Replace mocked OTP delivery with real SMS/email providers, then remove the
    non-production OTP echo from `POST /auth/otp/request` responses and the
    `otp` field from the client's request-OTP handling.
