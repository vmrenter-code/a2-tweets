class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);
	}

    private get strippedText():string {
        return this.text.replace(/https?:\/\/\S+/g, "").replace(/#Runkeeper/gi, "").trim();
    }

    get source():string {
        if (this.text.startsWith("Just completed") || this.text.startsWith("Just posted")) {
            return "completed_event";
        }
        if (this.text.startsWith("Watch my") || this.text.includes("#RKLive")) {
            return "live_event";
        }
        const lower = this.text.toLowerCase();
        if (this.text.startsWith("Achieved") || lower.includes("personal record") || lower.includes("goal")) {
            return "achievement";
        }
        return "miscellaneous";
    }

    get written():boolean {
        const dashIndex = this.strippedText.indexOf(" - ");
        if (dashIndex == -1) {
            return false;
        }
        const after = this.strippedText.substring(dashIndex + 3).trim();
        return after.length > 0 && after != "TomTom MySports Watch";
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        return this.strippedText.substring(this.strippedText.indexOf(" - ") + 3).trim();
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        const match = this.text.match(/^Just (?:completed|posted) an? (?:[\d.]+ (?:mi|km) )?(.+?)(?: in [\d:]+| with @Runkeeper| - |$)/);
        if (!match) {
            return "unknown";
        }
        return match[1].trim();
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const match = this.text.match(/^Just (?:completed|posted) an? ([\d.]+) (mi|km) /);
        if (!match) {
            return 0; 
        }
        const value = parseFloat(match[1]);
        //km to miles
        return match[2] == "km" ? value / 1.609 : value;
    }

    getHTMLTableRow(rowNumber:number):string {
        const linkedText = this.text.replace(/https?:\/\/\S+/g, (url) => `<a href="${url}" target="_blank">${url}</a>`);
        return `<tr><td>${rowNumber}</td><td>${this.activityType}</td><td>${linkedText}</td></tr>`;
    }
}
