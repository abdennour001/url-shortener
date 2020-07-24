document.addEventListener("DOMContentLoaded", function() {
    const app = new Vue({
        el: "#app",
        data: {
            slug: "",
            url: "",
            created: "",
            success: false,
            error: false,
            message: ""
        },
        mounted() {
            console.log("Vue");
        },
        methods: {
            async addUrl() {
                if (url === "") {
                    this.error = true;
                    return;
                }
                const response = await fetch("/url", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        slug: this.slug,
                        url: this.url
                    })
                });
                if (response.ok) {
                    const result = await response.json();
                    this.error = false;
                    this.success = true;
                    this.created = document.location.origin + "/" + this.slug;
                    this.slug = "";
                    this.url = "";
                    console.log(result);
                } else {
                    const result = await response.json();
                    this.message = result.error;
                    this.success = false;
                    this.error = true;
                }
            }
        }
    });
});
