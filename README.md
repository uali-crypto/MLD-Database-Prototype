Table of Contents:
1. What is the MLD-Database-Prototype? Why is it important? 
2. What aspects does this project contain? How does it work?
3. What do each of the different files do in this projects? 
4. What is to be done for the next part of the project? 
5. How do I work on this project? 


1.	What is the MLD-Database-Prototype? Why is it important?

MLD-Database-Prototype is a crowdsourcing platform to build a database for molecular layer deposition (MLD) data. Because of the advantages MLD provides for microelectronics over Atomic Layer Deposition (ALD), having a central database where researchers of MLD can consult for data allows for the procedure to catch on more effectively. Currently, MLD researchers have to consult libraries and directories sift through various MLD research papers to retrieve the data that they need. Such a process takes hours out of the researchers’ time that they could have used for further research.

2.	What aspects does this platform contain? How does it work? 

The MLD-Database-Prototype has two webpages: a data input page and a data presentation page. Both of these webpages are constructed through Hugo, a static website framework—learn about it here: https://gohugo.io. These two webpages are currently linked to a google spreadsheet that acts as the database. 

The data input webpage first has the user log into their ORCID account on a different webpage, which is connected to their account through ORCID’s API. After successfully logging in, the program redirects the user to the main program, which allows the user to access the main data input webpage. The user inputs all of the information, and then either selects “add another entry” or “submit”. If they submit the former, then the webpage will allow them to submit a second entry; if they select the latter, then all of the information will be submitted to the spreadsheet. Before getting submitted, the webpage will have a buffering text on the bottom right hand side of the screen. This buffering represents the program fetching the chemical information of the precursor information from PubChem. To successfully carry this out, the cheminformatics program RDKit in the MLD-Database-Prototype code matches the precursor name to the chemical information present on the Pubchem website. After it has done this, the information officially gets submitted to the spreadsheet, using a Google script API to connect the website to the spreadsheet. 

When data input webpage sends the data to the spreadsheet, the data on the data presentation webpage immediately displays the data on its end through the same Google script API. With this, users have the option to view two different MLD experiments: hybrid MLD and all-organic MLD. In both, a table below appears that transcribes all of the data from the spreadsheet into the tabulator table. The website code determines whether an experiment is a hybrid MLD or an all-organic MLD. 

If the user select hybrid MLD, a periodic table will appear on the page, showing all of the elements present in the various MLD experiments present in the database. Five functional groups at most can potentially appear in each element along with an “other” category. By clicking on each box that has a functional group, users can filter the table for experiments dealing with that element. For example, two precursors used in the experiment are trimethylaluminum and ethylene glycol, with the former having an aluminum atom and the latter having the functional group of alcohol/hydroxyl. The code can detect any precursor solution with a metallic component through code existing within the website program. So the code detects within the precursors an aluminum atom and an alcohol/hydroxyl functional group, and so marks the experiment entry with those designations. With that, it marks the aluminum box in the periodic table with the alcohol/hydroxyl designation—a legend box appears on the webpage so users can know which color represents which functional group. 

If the user selects all-organic MLD, a diagram with nucleophiles and electrophiles along with their potential products appears. When a user clicks on one of the products of the reaction between the nucleophile and an electrophile, the table filters to display any experiments with that particular reaction. Once again, code exists to determine which precursor is a nucleophile and which one is an electrophile, and what product is made from the precursors. For example, an experiment with the reactants (put reactants here) have an anime and a isocyanate functional group, and their product is a polyurea. Hence, the code will filter for anything with polyurea. 

3.	What do each of the different files do in this project?  

Within the framework, there are different directories with their own files. Here, I will give a quick walkthrough of what files are contained within each directory, and what those files do. 

Archetype 

Under the archetype directory there is a file called default.md. This file is some scaffolding for the website. I do not believe you would need to alter this file in any way. 

Content

Under the content directory there is a file called _index.md. This is a title page for the data input webpage, which is the default webpage for the website. The code “title:home” represents the home for the webpage. No need to alter this file. Moreover, there is a directory called “data”, which is the name for the data presentation page. Inside of this directory is a file called _index.md. There is no title for this webpage unlike the one for the input webpage because the former is the “home” for the website, not this data presentation webpage. 

Layouts

Under the layouts directory there is a file called index.html. This is the file that provides all of the code for the data input webpage. Here, you will find the code that builds up the webpage itself, code that connects this webpage to the ORCID authentication webpage, and code that contains all of the APIs that connects the webpage to PubChem, CrossRef (where information about research papers are), and Google Sheets through Google script. 

Within this code, there is section of code dedicated to building up the RDKit logic, with it being able to distinguish between hybrid and all-organic MLD. While everything should be working properly, keep a close eye on this section and the pubchem look up section below—if it doesn’t, then data won’t be properly stored in the google spreadsheet, and the information won’t be properly displayed on the data presentation webpage. 

Furthermore, pay attention to the first section within the html section (i.e. the ORCID login section). The line 
<a href="https://orcid-auth.uali-800.workers.dev/login" class="orcid-signin-btn"> 
is the URL that the main data input webpage redirects for users to authenticate themselves. This was specifically linked to my Cloudflare account, which is no longer linked to this project, so this link would not work. You would need to create a new URL based off of your Cloudflare account.  This section as a whole redirects to the user authentication code, which I will paste at the bottom of this ReadMe to not break the flow of this text. 

Moreover, there is a directory titled _default. In this there are the files .DS_Store, baseof.html, and taxonomy.html. .DS_Store is the file MacOS creates on its end; you do not need to worry about it for your website. Baseof.html contains the headers and footers for the data input webpage. You’ll notice that it’s empty of content and only contains scaffolding because it made the actual webpage look clunky. Taxonomy.html contains some additional scaffolding for the webpages. I did not need to alter this file throughout the duration of my project. 

Lastly, the directory titled data is located in this directory too. It contains the html of the data presentation page (list.html). Unlike for the data input webpage, the javascript for the data presentation page is located in a separate directory and file due to the complexity of the js code for the presentation page. 
Static

The static directory contains the css for the two webpages and the js for the data presentation page. Everything is labeled into sections for your convenience. 

Public 

The public directory contains every directory that presents information that is meant to be seen by the user. Every directory present has been elaborated upon besides categories. Categories contains files that further builds scaffolding for the website. I have not needed to alter the files for this project at any point, and I do not expect you to do so either. 

Hugo.toml

This is the last file to make note of. This file basically makes the hugo framework built up readable for the deployment website and gives it a URL. Because cloudflare automatically deploys git-hub website projects, you do not need to worry about updating this file. If you use a different deployment website, you’d need to potentially update this file. 

4.	What is the next part to be done for this project? 

Currently, the UI of the data presentation website needs to be updated. Brian will have ideas on this, so I would consult him on that. Moreover, for the all-organic side of the data presentation webpage, graphics for all of the nucleophiles, electrophiles, and products needs to be added. This should just be various image files added to the javascript code for the data presentation.

5.	How do I work on this project? 

There are a few ways to work on this project. You can work on it directly through GitHub, and push the edits as you go, or you can download the github project directly to your computer, and then link the local files to your github. When ready to publish edits, push to github using ssh commands. 

ORCID authentication code: 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Add CORS headers to all responses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://mld-database-prototype.pages.dev",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Step 1: Redirect user to ORCID login
    if (url.pathname === "/login") {
      const orcidAuthUrl = new URL("https://orcid.org/oauth/authorize");
      orcidAuthUrl.searchParams.set("client_id", env.ORCID_CLIENT_ID);
      orcidAuthUrl.searchParams.set("response_type", "code");
      orcidAuthUrl.searchParams.set("scope", "/authenticate");
      orcidAuthUrl.searchParams.set("redirect_uri", env.ORCID_REDIRECT_URI);

      return Response.redirect(orcidAuthUrl.toString(), 302);
    }

    // Step 2: Handle callback from ORCID
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");

      if (!code) {
        return new Response("No authorization code received", { status: 400 });
      }

      // Exchange code for access token
      const tokenResponse = await fetch("https://orcid.org/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.ORCID_CLIENT_ID,
          client_secret: env.ORCID_CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: env.ORCID_REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        return new Response("Failed to exchange token", { status: 500 });
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      const orcidId = tokenData.orcid;

      // Fetch user info from ORCID
      const personResponse = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/person`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`
        }
      });

      const personData = await personResponse.json();
      const given = personData.name?.["given-names"]?.value || "";
      const family = personData.name?.["family-name"]?.value || "";
      const fullName = `${given} ${family}`.trim();

      // Get emails if available
      const emails = personData.emails?.email || [];
      const primaryEmail = emails.find(e => e.primary)?.email || emails[0]?.email || "";

      // Get affiliations/institution if available
      const affiliations = personData["affiliations"]?.["affiliation"] || [];
      const institution = affiliations[0]?.organization?.name || "";

      // Redirect back to the form with user info as URL parameters
      const redirectUrl = new URL("https://mld-database-prototype.pages.dev/");
      redirectUrl.searchParams.set("orcid", orcidId);
      redirectUrl.searchParams.set("name", fullName);
      redirectUrl.searchParams.set("email", primaryEmail);
      redirectUrl.searchParams.set("institution", institution);

      return Response.redirect(redirectUrl.toString(), 302);
    }

    return new Response("Not found", { status: 404 });
  }
};
