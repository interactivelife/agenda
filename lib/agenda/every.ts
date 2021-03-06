import createDebugger from 'debug';
import {Agenda} from './index';
import {Job} from '../job';

const debug = createDebugger('agenda:every');

/**
 * Creates a scheduled job with given interval and name/names of the job to run
 * @name Agenda#every
 * @function
 * @param interval - run every X interval
 * @param names - String or strings of jobs to schedule
 * @param data - data to run for job
 * @param options - options to run job for
 * @returns Job/s created. Resolves when schedule fails or passes
 */
export const every = async function (this : Agenda, interval : string | number, names : string | string[], data : any, startDate : any, endDate : any, type : string, options : any) : Promise < any > { /**
   * Internal method to setup job that gets run every interval
   * @param interval run every X interval
   * @param name String job to schedule
   * @param data data to run for job
   * @param options options to run job for
   * @returns instance of job
   */
    const createJob = async (interval : number | string, name : string, data : any, startDate : any, endDate : any, type : string, options : any) => {
        const job = this.create(name, startDate, endDate, type, data);

        job.attrs.type = 'single';
        job.repeatEvery(interval, options);
        await job.save();

        return job;
    };

    /**
   * Internal helper method that uses createJob to create jobs for an array of names
   * @param interval run every X interval
   * @param names Strings of jobs to schedule
   * @param data data to run for job
   * @param options options to run job for
   * @return array of jobs created
   */
    const createJobs = (interval : string | number, names : string[], data : any, startDate : any, endDate : any, type : string, options : any): Promise < Job[] > | undefined => {
        try {
            const jobs = names.map(name => createJob(interval, name, data, startDate, endDate, type, options));

            debug('every() -> all jobs created successfully');

            return Promise.all(jobs);
        } catch (error) { // @TODO: catch - ignore :O
            debug('every() -> error creating one or more of the jobs', error);
        }
    };

    if (typeof names === 'string') {
        debug('Agenda.every(%s, %O, %O)', interval, names, options);
        const jobs = await createJob(interval, names, data, startDate, endDate, type, options);

        return jobs;
    }

    if (Array.isArray(names)) {
        debug('Agenda.every(%s, %s, %O)', interval, names, options);
        const jobs = await createJobs(interval, names, data, startDate, endDate, type, options);

        return jobs;
    }
};
