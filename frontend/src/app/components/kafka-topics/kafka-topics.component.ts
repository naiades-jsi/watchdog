import { Component, OnInit } from '@angular/core';

import { Source } from '../../models/source';

import { SourcesService } from '../../services/sources.service';

@Component({
    selector: 'app-kafka-topics',
    templateUrl: './kafka-topics.component.html',
    styleUrls: ['./kafka-topics.component.css']
})
export class KafkaTopicsComponent implements OnInit {

    interval: any;
    sources: Source[] = [];

    constructor(private sourceService: SourcesService) { }

    private async getAllKafkaSources(): Promise<void> {
        await this.sourceService
                    .getKafkaSources()
                    .then((sources) => {
                        this.sources = sources;
                    });
    }

    ngOnInit(): void {
        this.getAllKafkaSources();
        this.interval = setInterval(() => {
            this.getAllKafkaSources();
        }, 30000);
    }

}
